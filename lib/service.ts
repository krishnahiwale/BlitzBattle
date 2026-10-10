import { packs, catalog, position, score, QUESTION_MS, COUNTDOWN_MS, type PackId } from './questions';
type DB = any;
const fail=(message:string,status=400):never=>{throw Object.assign(new Error(message),{status})};
const clean=(s:unknown,max:number)=>typeof s==='string'?s.trim().slice(0,max):'';
export async function battleService(db:DB, session:string, action:string, body:any={}, now=Date.now()) {
 const one=async(sql:string,...args:any[])=>db.prepare(sql).bind(...args).first();
 const all=async(sql:string,...args:any[])=>(await db.prepare(sql).bind(...args).all()).results;
 const run=async(sql:string,...args:any[])=>db.prepare(sql).bind(...args).run();
 if(action==='home') {
  const live=await all(`SELECT r.code,r.title,r.pack,r.created,r.started,r.sponsored,r.pool,COUNT(p.id) AS players FROM rooms r LEFT JOIN players p ON p.room=r.code WHERE r.practice=0 AND r.created>? AND (r.started IS NULL OR r.started>?) GROUP BY r.code ORDER BY r.created DESC LIMIT 12`,now-86400000,now-100000);
  const history=await all(`SELECT r.code,r.title,r.pack,r.started,r.practice,p.id,COALESCE(SUM(a.points),0) AS score,COALESCE(SUM(a.correct),0) AS correct,COUNT(a.question) AS answered FROM players p JOIN rooms r ON r.code=p.room LEFT JOIN answers a ON a.player=p.id WHERE p.session=? GROUP BY p.id ORDER BY r.created DESC LIMIT 30`,session);
  return {packs:catalog(),live,history,session,now};
 }
 if(action==='create') {
  const title=clean(body.title,60), name=clean(body.name,24), pack=body.pack as PackId;
  if(!title||!name||!packs[pack]) fail('Choose a pack and enter your name and battle title.');
  const recent=await one('SELECT COUNT(*) AS n FROM rooms WHERE host=? AND created>?',session,now-3600000);
  if(recent.n>=30) fail('You have created 30 rooms this hour. Try an existing room.',429);
  const bytes=crypto.getRandomValues(new Uint8Array(6));
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code=Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');
  const practice=body.practice?1:0,sponsored=!practice&&body.sponsored?1:0;
  await db.batch([
   db.prepare('INSERT INTO rooms (code,title,pack,host,created,practice,sponsored) VALUES (?,?,?,?,?,?,?)').bind(code,title,pack,session,now,practice,sponsored),
   db.prepare('INSERT INTO players (id,room,session,name,joined) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),code,session,name,now)
  ]);
  return {code};
 }
 const code=clean(body.code,6).toUpperCase();
 const room=await one('SELECT * FROM rooms WHERE code=?',code);
 if(!room) fail('Battle not found. Check the six-character room code.',404);
 const host=room.host===session;
 let me=await one('SELECT * FROM players WHERE room=? AND session=?',code,session);
 const index=position(room.started,now), questions=packs[room.pack as PackId].questions;
 const finished=room.started!==null&&index>=questions.length;
 if(action==='join') {
  if(me) return {code};
  if(room.started!==null) fail('This battle has already started. Create a new room.');
  if(room.practice) fail('This is a solo practice room.');
  const name=clean(body.name,24); if(!name) fail('Enter a display name.');
  const result=await run(`INSERT INTO players (id,room,session,name,joined) SELECT ?,?,?,?,? WHERE (SELECT COUNT(*) FROM players WHERE room=?)<16 AND (SELECT started FROM rooms WHERE code=?) IS NULL`,crypto.randomUUID(),code,session,name,now,code,code);
  if(!result.meta.changes) fail('This room is full or has just started.');
  return {code};
 }
 if(action==='start') {
  if(!host) fail('Only the host can start this battle.',403);
  if(room.started!==null) fail('This battle has already started.');
  if(room.sponsored && !room.fund_tx) fail('Fund the testnet reward pool before starting.');
  const p=await all('SELECT wallet FROM players WHERE room=?',code);
  const solo=body.solo===true&&!room.sponsored&&!room.practice;
  if(solo&&p.length!==1) fail('A challenger has joined. Start the battle again to play together.');
  if(p.length<(room.practice||solo?1:2)) fail('Invite at least one other player, or choose Start solo practice.');
  if(room.sponsored&&p.some((x:any)=>!x.wallet)) fail('Every player must link their wallet before a sponsored battle starts.');
  // A concurrent join must not become a participant in a solo conversion.
  const result=await run(`UPDATE rooms SET started=?,practice=? WHERE code=? AND started IS NULL AND (?=0 OR NOT EXISTS(SELECT 1 FROM players WHERE room=? AND wallet IS NULL)) AND (?=0 OR (SELECT COUNT(*) FROM players WHERE room=?)=1)`,now+COUNTDOWN_MS,solo?1:room.practice,code,room.sponsored,code,solo?1:0,code);
  if(!result.meta.changes) fail('Room changed. Refresh and try again.');
  return {ok:true};
 }
 if(action==='answer') {
  if(!me) fail('Join the battle first.',403);
  if(index<0||finished) fail('There is no active question.');
  if(body.question!==index) fail('The next question has started.');
  if(!Number.isInteger(body.choice)||body.choice<0||body.choice>3) fail('Choose one of the four answers.');
  const correct=body.choice===questions[index].answer;
  const points=score(correct,room.started+(index+1)*QUESTION_MS-now);
  const r=await run('INSERT OR IGNORE INTO answers (player,room,question,choice,correct,points,at) VALUES (?,?,?,?,?,?,?)',me.id,code,index,body.choice,correct?1:0,points,now);
  if(!r.meta.changes) fail('Your answer is already locked in.');
  // Do not reveal correctness while the shared question is active.
  return {locked:true};
 }
 if(action==='state') {
  const roster=await all(`SELECT p.id,p.name,p.wallet,p.joined,COALESCE(SUM(a.points),0) AS score,COALESCE(SUM(a.correct),0) AS correct,COUNT(a.question) AS answered FROM players p LEFT JOIN answers a ON a.player=p.id AND (a.question<? OR ?=1) WHERE p.room=? GROUP BY p.id ORDER BY score DESC,p.joined ASC,p.id ASC`,index,finished?1:0,code);
  const myAnswers=me?await all('SELECT question,choice,points,correct FROM answers WHERE player=? ORDER BY question',me.id):[];
  const podium=finished?roster.filter((p:any)=>p.score===roster[0]?.score):[];
  const active=index>=0&&index<questions.length?questions[index]:null;
  return {code:room.code,title:room.title,pack:room.pack,practice:!!room.practice,sponsored:!!room.sponsored,created:room.created,started:room.started,host,me:me?.id??null,players:roster,index,finished,now,questionCount:questions.length,questionMs:QUESTION_MS,deadline:active?room.started+(index+1)*QUESTION_MS:null,question:active?{text:active.text,options:active.options,topic:active.topic}:null,myAnswer:myAnswers.find((a:any)=>a.question===index)?.choice??null,recap:finished?questions.map((q,i)=>({...q,selected:myAnswers.find((a:any)=>a.question===i)?.choice??null,points:myAnswers.find((a:any)=>a.question===i)?.points??0})):[],winners:podium.map((p:any)=>({id:p.id,name:p.name,wallet:p.wallet})),funding:{address:room.contract,tx:room.fund_tx,settleTx:room.settle_tx,pool:room.pool,sponsor:room.sponsor}};
 }
 if(action==='insights') {
  if(!host||!finished) fail('Host insights are available after the battle.',403);
  const count=await one('SELECT COUNT(*) AS n FROM players WHERE room=?',code);
  const data=await all('SELECT question,SUM(correct) AS correct,COUNT(*) AS answered FROM answers WHERE room=? GROUP BY question',code);
  return {topics:questions.map((q,i)=>({topic:q.topic,correct:data.find((x:any)=>x.question===i)?.correct??0,answered:data.find((x:any)=>x.question===i)?.answered??0,total:count.n}))};
 }
 fail('Unknown action.',404);
}
