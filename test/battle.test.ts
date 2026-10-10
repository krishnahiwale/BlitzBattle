import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {battleService} from '../lib/service';
const base=1900000000000;
function database(){
 const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync('drizzle/0000_closed_jubilee.sql','utf8'));
 const wrap=(sql:string,params:any[]=[])=>({
  bind(...args:any[]){return wrap(sql,args)},
  async first(){return sqlite.prepare(sql).get(...params)||null},
  async all(){return {results:sqlite.prepare(sql).all(...params)}},
  async run(){const r=sqlite.prepare(sql).run(...params);return {meta:{changes:Number(r.changes)}}}
 });
 return {prepare:(sql:string)=>wrap(sql),batch:async(stmts:any[])=>{sqlite.exec('BEGIN');try{const r=[];for(const s of stmts)r.push(await s.run());sqlite.exec('COMMIT');return r}catch(e){sqlite.exec('ROLLBACK');throw e}},close:()=>sqlite.close()};
}
async function create(db:any,practice=false){return battleService(db,'host','create',{title:'Test arena',name:'Krishna',pack:'ai',practice},base) as any;}
test('multiplayer: host authorization, server scoring, hidden answers, duplicates and finished recap',async()=>{
 const db=database();const {code}=await create(db);
 await assert.rejects(()=>battleService(db,'host','start',{code},base+100),/Invite at least/);
 await battleService(db,'friend','join',{code,name:'Alex'},base+200);
 await assert.rejects(()=>battleService(db,'friend','start',{code},base+300),/Only the host/);
 await battleService(db,'host','start',{code},base+400);
 const start=base+4400;
 let state:any=await battleService(db,'host','state',{code},start+1);
 assert.equal(state.question.answer,undefined);assert.equal(state.recap.length,0);assert.equal(state.host,true);
 const answer:any=await battleService(db,'host','answer',{code,question:0,choice:1,points:99999},start+1000);
 assert.deepEqual(answer,{locked:true});
 await assert.rejects(()=>battleService(db,'host','answer',{code,question:0,choice:1},start+1100),/already locked/);
 state=await battleService(db,'host','state',{code},start+1500);assert.equal(state.players[0].score,0);assert.equal(state.myAnswer,1);
 state=await battleService(db,'host','state',{code},start+20000);assert.equal(state.players[0].score,147);
 await assert.rejects(()=>battleService(db,'host','answer',{code,question:0,choice:1},start+20001),/next question/);
 await assert.rejects(()=>battleService(db,'late','join',{code,name:'Late'},start+20001),/already started/);
 state=await battleService(db,'host','state',{code},start+100000);assert.equal(state.finished,true);assert.equal(state.recap.length,5);assert.equal(state.recap[0].answer,1);assert.equal(state.recap[1].selected,null);assert.equal(state.winners[0].name,'Krishna');
 await assert.rejects(()=>battleService(db,'host','answer',{code,question:4,choice:1},start+100001),/no active question/);
 const insight:any=await battleService(db,'host','insights',{code},start+100001);assert.equal(insight.topics[0].correct,1);assert.equal(insight.topics[0].total,2);
 await assert.rejects(()=>battleService(db,'friend','insights',{code},start+100001),/Host insights/);
 db.close();
});
test('solo practice works and ties preserve all winning players',async()=>{
 const db=database();const solo=await create(db,true);await battleService(db,'host','start',{code:solo.code},base+1);
 await assert.rejects(()=>battleService(db,'other','join',{code:solo.code,name:'No'},base+2),/started|solo/);
 const soloState:any=await battleService(db,'host','state',{code:solo.code},base+104001);assert.equal(soloState.finished,true);assert.equal(soloState.practice,true);
 const {code}=await create(db);await battleService(db,'friend','join',{code,name:'Alex'},base+1);await battleService(db,'host','start',{code},base+2);
 const state:any=await battleService(db,'host','state',{code},base+104002);assert.equal(state.winners.length,2);db.close();
});
test('capacity, session uniqueness, missing input and sponsored readiness',async()=>{
 const db=database();await assert.rejects(()=>battleService(db,'host','create',{name:'A',title:'B',pack:'bad'},base),/Choose a pack/);
 const {code}=await create(db);for(let i=0;i<15;i++)await battleService(db,'p'+i,'join',{code,name:'Player '+i},base+i+1);
 await battleService(db,'p0','join',{code,name:'Again'},base+20);
 await assert.rejects(()=>battleService(db,'p16','join',{code,name:'Full'},base+21),/full/);
 const state:any=await battleService(db,'host','state',{code},base+25);assert.equal(state.players.length,16);
 const reward:any=await battleService(db,'host','create',{name:'H',title:'Reward',pack:'web3',sponsored:true},base+30);
 await assert.rejects(()=>battleService(db,'host','start',{code:reward.code},base+31),/Fund the testnet/);
 await db.prepare('UPDATE rooms SET fund_tx=? WHERE code=?').bind('verified-test',reward.code).run();
 await battleService(db,'friend','join',{code:reward.code,name:'A'},base+32);
 await assert.rejects(()=>battleService(db,'host','start',{code:reward.code},base+33),/Every player/);
 await db.prepare('UPDATE players SET wallet=id WHERE room=?').bind(reward.code).run();await battleService(db,'host','start',{code:reward.code},base+34);
 const home:any=await battleService(db,'friend','home',{},base+35);assert.equal(home.history.length,1);db.close();
});

import {battleIdentity,SESSION_HEADER} from '../lib/session';
import {createBattleApi,SESSION_KEY} from '../lib/client-api';

test('blocked cookies: create, reload, start and answer retain the host; parallel requests bootstrap once',async()=>{
 const db=database();let now=base,handshakes=0;
 const storageData=new Map<string,string>();
 const storage={getItem:(key:string)=>storageData.get(key)??null,setItem:(key:string,value:string)=>{storageData.set(key,value)}};
 const transport:typeof fetch=async(input,init)=>{
  const request=new Request(new URL(String(input),'https://battle.example'),init);
  // Browser deliberately discards every Set-Cookie response in this test.
  assert.equal(request.headers.get('cookie'),null);
  const auth=await battleIdentity(request);
  const body:any=request.method==='POST'?await request.json():Object.fromEntries(new URL(request.url).searchParams);
  if(body.action==='session'){handshakes++;return Response.json({token:auth.token});}
  try{return Response.json(await battleService(db,auth.session,body.action,body,now))}
  catch(error:any){return Response.json({error:error.message},{status:error.status||400})}
 };
 const api=createBattleApi(transport,()=>storage);
 const homes=await Promise.all([api('home',{},true),api('home',{},true),api('home',{},true)]);
 assert.equal(handshakes,1);assert.equal(homes[0].session,homes[2].session);
 assert.notEqual(storage.getItem(SESSION_KEY),homes[0].session,'Public session identifier is not the bearer credential');
 const {code}=await api('create',{title:'Cookie-blocked room',name:'Host',pack:'ai'});
 let state=await api('state',{code},true);assert.equal(state.host,true);assert.ok(state.me);assert.equal(state.players.length,1);
 const originalPlayer=state.me;
 await api('join',{code,name:'Host'});state=await api('state',{code},true);assert.equal(state.players.length,1);
 const reloaded=createBattleApi(transport,()=>storage);
 state=await reloaded('state',{code},true);assert.equal(state.host,true);assert.equal(state.me,originalPlayer);assert.equal(handshakes,1);
 await reloaded('start',{code,solo:true});state=await reloaded('state',{code},true);assert.equal(state.practice,true);assert.equal(state.index,-1);
 now+=5000;state=await reloaded('state',{code},true);assert.equal(state.index,0);assert.ok(state.question);
 await reloaded('answer',{code,question:0,choice:1});state=await reloaded('state',{code},true);assert.equal(state.myAnswer,1);
 // Knowing the public identifier does not allow another session to act as host.
 const guessed=await battleIdentity(new Request('https://battle.example',{headers:{[SESSION_HEADER]:homes[0].session}}));
 assert.notEqual(guessed.session,homes[0].session);
 await assert.rejects(()=>battleService(db,guessed.session,'start',{code},now),/Only the host/);
 db.close();
});

test('legacy cookie identity migrates; malformed credentials are rejected',async()=>{
 const original=await battleIdentity(new Request('https://battle.example'));
 const cookieRequest=new Request('https://battle.example',{headers:{cookie:'bb_session='+original.token}});
 const migrated=await battleIdentity(cookieRequest);assert.equal(migrated.session,original.session);assert.equal(migrated.token,original.token);
 const headerOnly=await battleIdentity(new Request('https://battle.example',{headers:{[SESSION_HEADER]:migrated.token}}));
 assert.equal(headerOnly.session,original.session);
 await assert.rejects(()=>battleIdentity(new Request('https://battle.example',{headers:{[SESSION_HEADER]:'invalid'}})),/Invalid player session/);
});

test('solo start cannot convert a room with another player or bypass reward prerequisites',async()=>{
 const db=database();const {code}=await create(db);await battleService(db,'other','join',{code,name:'Other'},base+1);
 await assert.rejects(()=>battleService(db,'host','start',{code,solo:true},base+2),/challenger has joined/);
 const r:any=await battleService(db,'host','create',{title:'Sponsored',name:'Host',pack:'ai',sponsored:true},base+3);
 await assert.rejects(()=>battleService(db,'host','start',{code:r.code,solo:true},base+4),/Fund the testnet/);
 await db.prepare('UPDATE rooms SET fund_tx=? WHERE code=?').bind('test-only',r.code).run();
 await db.prepare('UPDATE players SET wallet=? WHERE room=?').bind('test-wallet',r.code).run();
 await assert.rejects(()=>battleService(db,'host','start',{code:r.code,solo:true},base+5),/Invite at least/);
 const state:any=await battleService(db,'host','state',{code:r.code},base+6);assert.equal(state.started,null);assert.equal(state.practice,false);db.close();
});
