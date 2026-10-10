import {parseEther,verifyMessage,id as roomKey} from "ethers";
import {makeQuestions} from "./questions";
import {phaseAt,eligibleWinners,INTRO_MS,REVEAL_MS} from "./game";
import type {Question,PackId,Snapshot,Player} from "./types";
import {verifyFunding,verifyFinalization,verifyClaim,verifyRefund} from "./chain-server";

export interface Statement {bind(...args:unknown[]):Statement;first<T=Record<string,unknown>>():Promise<T|null>;all<T=Record<string,unknown>>():Promise<{results:T[]}>;run():Promise<{meta:{changes?:number}}>}
export interface Database {prepare(sql:string):Statement;batch(items:Statement[]):Promise<unknown[]>}
type Room={code:string;host_hash:string;owner_id:string;title:string;sponsor:string;pack:PackId;mode:"practice"|"monad";seconds:number;status:string;questions:string;created_at:number;started_at:number|null;pool_wei:string;escrow:string|null;funding_tx:string|null;finalized_tx:string|null;finalize_before:number|null;claim_until:number|null;refund_tx:string|null};
type PlayerRow={id:string;room_code:string;name:string;token_hash:string;joined_at:number;bot:number;wallet:string|null;challenge:string|null;challenge_expires:number|null;claim_tx:string|null};
type Answer={player_id:string;question:number;choice:number;earned:number;submitted_at:number};
class ApiError extends Error{constructor(public status:number,message:string){super(message)}}
function check(ok:unknown,message:string,status=400):asserts ok{if(!ok)throw new ApiError(status,message)}
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
async function digest(text:string){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));return Array.from(new Uint8Array(b),v=>v.toString(16).padStart(2,"0")).join("")}
const token=()=>crypto.randomUUID()+crypto.randomUUID();
function shortCode(){const bytes=new Uint32Array(6);crypto.getRandomValues(bytes);return Array.from(bytes,v=>"ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[v%32]).join("")}
function auth(req:Request){return req.headers.get("authorization")?.replace(/^Bearer /i,"")??""}
async function isHost(req:Request,room:Room){return Boolean(auth(req))&&await digest(auth(req))===room.host_hash&&req.headers.get("oai-authenticated-user-id")===room.owner_id}
async function requireHost(req:Request,room:Room){check(await isHost(req,room),"Only the host can do that.",403)}
async function getPlayer(db:Database,req:Request,room:Room){if(!auth(req))return null;return db.prepare("SELECT * FROM players WHERE room_code=? AND token_hash=? AND bot=0").bind(room.code,await digest(auth(req))).first<PlayerRow>()}
async function requirePlayer(db:Database,req:Request,room:Room){const p=await getPlayer(db,req,room);check(p,"Join this battle first.",401);return p}
async function getRoom(db:Database,code:string){const r=await db.prepare("SELECT * FROM rooms WHERE code=?").bind(code.toUpperCase()).first<Room>();check(r,"Battle not found. Check the room code.",404);return r}
const questions=(room:Room):Question[]=>JSON.parse(room.questions);

async function snapshot(db:Database,req:Request,room:Room,now:number):Promise<Snapshot>{
 const qs=questions(room), state=phaseAt(room.status,room.started_at,room.seconds,qs.length,now);
 const [ps,as,meRow,host]=await Promise.all([
  db.prepare("SELECT * FROM players WHERE room_code=? ORDER BY joined_at,id").bind(room.code).all<PlayerRow>(),
  db.prepare("SELECT player_id,question,choice,earned,submitted_at FROM answers WHERE room_code=? AND submitted_at<=?").bind(room.code,now).all<Answer>(),
  getPlayer(db,req,room),isHost(req,room)
 ]);
 // Future bot answers never leave the server or count before their submission time.
 const leaderboard:Player[]=ps.results.map(p=>{const pa=as.results.filter(a=>a.player_id===p.id);return {id:p.id,name:p.name,bot:!!p.bot,wallet:p.wallet,score:pa.reduce((s,a)=>s+a.earned,0),correct:pa.filter(a=>a.earned===100).length,claimTx:p.claim_tx}}).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
 const me=leaderboard.find(p=>p.id===meRow?.id)??null;
 const q=qs[state.index],reveal=state.phase==="reveal";
 const visible=(state.phase==="question"||reveal)?{prompt:q.prompt,options:q.options,concept:q.concept,...(reveal?{correct:q.correct,explanation:q.explanation}:{})}:null;
 const mine=as.results.filter(a=>a.player_id===me?.id);
 const humans=new Set(ps.results.filter(p=>!p.bot).map(p=>p.id));
 const analytics=state.phase==="finished"&&host?qs.map((q,i)=>({concept:q.concept,correct:as.results.filter(a=>a.question===i&&a.earned===100&&humans.has(a.player_id)).length,total:humans.size})):[];
 return {code:room.code,title:room.title,sponsor:room.sponsor,pack:room.pack,mode:room.mode,seconds:room.seconds,phase:state.phase,index:state.index,total:qs.length,serverNow:now,phaseEndsAt:state.endsAt,startedAt:room.started_at,createdAt:room.created_at,question:visible,leaderboard,me,answer:mine.find(a=>a.question===state.index)?.choice??null,answered:as.results.filter(a=>a.question===state.index).length,host,winners:state.phase==="finished"?eligibleWinners(leaderboard):[],recap:state.phase==="finished"&&me?qs.map((q,i)=>({...q,choice:mine.find(a=>a.question===i)?.choice??null})):[],analytics,poolWei:room.pool_wei,escrow:room.escrow,fundingTx:room.funding_tx,finalizedTx:room.finalized_tx,finalizeBefore:room.finalize_before,claimUntil:room.claim_until,refundTx:room.refund_tx};
}
async function addPlayer(db:Database,room:Room,name:string,now:number,bot=false){
 check(name.trim().length>=2&&name.trim().length<=24,"Use a name between 2 and 24 characters.");
 const playerToken=token(),playerId=crypto.randomUUID();
 const result=await db.prepare("INSERT INTO players (id,room_code,name,token_hash,joined_at,bot) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM rooms WHERE code=? AND started_at IS NULL AND status='waiting') AND (SELECT COUNT(*) FROM players WHERE room_code=?)<20").bind(playerId,room.code,name.trim(),await digest(playerToken),now,bot?1:0,room.code,room.code).run();
 check(result.meta.changes,"The battle has started or the room is full.",409);
 return {playerToken,playerId};
}
async function start(db:Database,room:Room,now:number){
 check(!room.started_at&&room.status==="waiting","This battle has already started.",409);
 const ps=(await db.prepare("SELECT * FROM players WHERE room_code=?").bind(room.code).all<PlayerRow>()).results;
 check(ps.some(p=>!p.bot),"At least one player must join before you start.");
 if(room.mode==="monad"){
  check(room.escrow&&room.funding_tx&&!room.refund_tx,"Confirm the prize funding first.");
  check(ps.some(p=>p.wallet&&!p.bot),"At least one player must verify a wallet before a reward battle.");
  check((room.finalize_before??0)>now+INTRO_MS+questions(room).length*(room.seconds*1000+REVEAL_MS)+60000,"Funding expires too soon to finish this battle.");
 }
 const result=await db.prepare("UPDATE rooms SET status='live',started_at=? WHERE code=? AND started_at IS NULL AND status='waiting'").bind(now,room.code).run();
 check(result.meta.changes,"This battle has already started.",409);
 const qs=questions(room);
 const botAnswers:Statement[]=[];
 for(const [bi,p]of ps.filter(p=>p.bot).entries())for(let i=0;i<qs.length;i++){
  const correct=(i+bi)%3!==2,choice=correct?qs[i].correct:(qs[i].correct+1)%4;
  botAnswers.push(db.prepare("INSERT INTO answers (id,room_code,player_id,question,choice,earned,submitted_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),room.code,p.id,i,choice,correct?100:0,now+INTRO_MS+i*(room.seconds*1000+REVEAL_MS)+Math.floor(room.seconds*1000*(.4+bi*.15))));
 }
 if(botAnswers.length)await db.batch(botAnswers);
}
export async function handleBattleRequest(req:Request,db:Database,clock=Date.now):Promise<Response>{
 try{
  const now=clock(),url=new URL(req.url),parts=url.pathname.replace(/^\/api\/battles\/?/,"").split("/").filter(Boolean);
  if(req.method!=="GET"&&req.method!=="POST")return json({error:"Method not allowed."},405);
  if(req.method==="POST"){
   check(!req.headers.get("origin")||req.headers.get("origin")===url.origin,"Use this site's own battle controls.",403);
   check(Number(req.headers.get("content-length")??0)<10000,"Request too large.",413);
  }
  let body:Record<string,unknown>={};
  if(req.method==="POST"){try{body=await req.json()}catch{throw new ApiError(400,"Send a valid JSON request.")}check(body&&typeof body==="object"&&!Array.isArray(body),"Invalid request.")}
  if(!parts.length){
   if(req.method==="GET"){
    const rows=(await db.prepare("SELECT r.code,r.title,r.sponsor,r.pack,r.mode,r.status,r.created_at,r.started_at,r.seconds,r.pool_wei,r.escrow,COUNT(p.id) AS players FROM rooms r LEFT JOIN players p ON p.room_code=r.code GROUP BY r.code ORDER BY r.created_at DESC LIMIT 12").all<Record<string,unknown>>()).results;
    return json({rooms:rows.map(r=>({...r,status:phaseAt(r.status as string,r.started_at as number|null,r.seconds as number,5,now).phase})),serverNow:now});
   }
   const owner=req.headers.get("oai-authenticated-user-id");check(owner,"Sign in with ChatGPT to host a battle.",401);
   const recent=await db.prepare("SELECT COUNT(*) AS n FROM rooms WHERE owner_id=? AND created_at>?").bind(owner,now-60000).first<{n:number}>();
   check((recent?.n??0)<10,"Please wait a minute before creating another battle.",429);
   const pack=body.pack as PackId;check(["ai","web3","data"].includes(pack),"Choose a challenge pack.");
   const mode=body.mode==="monad"?"monad":"practice",seconds=Number(body.seconds??12);
   check([10,12,15,20].includes(seconds),"Choose a supported question timer.");
   const title=String(body.title??"Quick battle").trim(),sponsor=String(body.sponsor??"Your college club").trim();
   check(title.length>=3&&title.length<=64,"Use a title between 3 and 64 characters.");check(sponsor.length>=2&&sponsor.length<=48,"Use a club or sponsor name between 2 and 48 characters.");
   let pool=0n;if(mode==="monad"){try{pool=parseEther(String(body.rewardMon??"0.03"))}catch{throw new ApiError(400,"Enter a valid MON amount.")}check(pool>=parseEther("0.001")&&pool<=parseEther("1"),"Use 0.001 to 1 testnet MON for this MVP.")}
   const code=shortCode(),hostToken=token();
   await db.prepare("INSERT INTO rooms (code,host_hash,owner_id,title,sponsor,pack,mode,seconds,status,questions,created_at,pool_wei) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(code,await digest(hostToken),owner,title,sponsor,pack,mode,seconds,"waiting",JSON.stringify(makeQuestions(pack)),now,pool.toString()).run();
   const room=await getRoom(db,code);
   if(mode==="practice"&&body.bots===true){await addPlayer(db,room,"Mira",now+1,true);await addPlayer(db,room,"Neo",now+2,true)}
   return json({code,hostToken},201);
  }
  check(/^[A-Z2-9]{6}$/i.test(parts[0]),"Use the six-character battle code.",404);
  const room=await getRoom(db,parts[0]),action=parts[1]??"";
  check(parts.length<=2,"Route not found.",404);
  if(req.method==="GET"&&!action)return json(await snapshot(db,req,room,now));
  check(req.method==="POST","Route not found.",404);
  if(action==="join"){
   check(!room.started_at&&room.status==="waiting","This battle has started. You can still watch.",409);
   return json(await addPlayer(db,room,String(body.name??""),now),201);
  }
  if(action==="start"){await requireHost(req,room);await start(db,room,now);return json({ok:true})}
  if(action==="answer"){
   const p=await requirePlayer(db,req,room),qs=questions(room),state=phaseAt(room.status,room.started_at,room.seconds,qs.length,now);
   check(state.phase==="question","This question is closed.",409);
   const index=Number(body.question),choice=Number(body.choice);
   check(Number.isInteger(index)&&index===state.index,"This answer belongs to a different question.",409);
   check(Number.isInteger(choice)&&choice>=0&&choice<4,"Choose one of the four answers.");
   await db.prepare("INSERT INTO answers (id,room_code,player_id,question,choice,earned,submitted_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),room.code,p.id,index,choice,choice===qs[index].correct?100:0,now).run();
   return json({accepted:true});
  }
  if(action==="wallet-challenge"){
   const p=await requirePlayer(db,req,room);check(room.mode==="monad"&&!room.started_at,"Verify your wallet before the reward battle starts.",409);
   const expires=now+300000,challenge=`BlitzBattle wallet verification\nRoom: ${room.code}\nPlayer: ${p.id}\nNonce: ${crypto.randomUUID()}\nExpires: ${new Date(expires).toISOString()}\nThis signature verifies wallet ownership. It does not transfer funds.`;
   await db.prepare("UPDATE players SET challenge=?,challenge_expires=? WHERE id=?").bind(challenge,expires,p.id).run();
   return json({message:challenge});
  }
  if(action==="wallet-verify"){
   const p=await requirePlayer(db,req,room);check(room.mode==="monad"&&!room.started_at&&p.challenge&&(p.challenge_expires??0)>now,"Request a fresh wallet signature before the battle starts.",409);
   let wallet:string;try{wallet=verifyMessage(p.challenge,String(body.signature)).toLowerCase()}catch{throw new ApiError(400,"Wallet signature could not be verified.")}
   const result=await db.prepare("UPDATE players SET wallet=?,challenge=NULL,challenge_expires=NULL WHERE id=? AND challenge=? AND EXISTS (SELECT 1 FROM rooms WHERE code=? AND started_at IS NULL)").bind(wallet,p.id,p.challenge,room.code).run();
   check(result.meta.changes,"The battle started or this signature was already used.",409);return json({wallet});
  }
  if(action==="fund"){
   await requireHost(req,room);check(room.mode==="monad"&&!room.started_at,"Funding is only available before a reward battle.",409);
   check(!room.escrow,"This battle is already funded.",409);
   const verified=await verifyFunding(String(body.tx),roomKey("BlitzBattle:"+room.code),room.pool_wei);
   await db.prepare("UPDATE rooms SET escrow=?,funding_tx=?,finalize_before=?,claim_until=? WHERE code=? AND escrow IS NULL AND started_at IS NULL").bind(verified.address,String(body.tx),verified.finalizeBefore,verified.claimUntil,room.code).run();
   return json({ok:true});
  }
  if(action==="finalize"){
   await requireHost(req,room);const s=await snapshot(db,req,room,now);
   check(s.phase==="finished"&&room.escrow&&s.winners.length,"Finish a funded battle with eligible winners first.",409);
   check(!room.finalized_tx,"Rewards are already finalized.",409);
   await verifyFinalization(String(body.tx),room.escrow,s.winners.map(p=>p.wallet!),room.pool_wei);
   await db.prepare("UPDATE rooms SET finalized_tx=? WHERE code=? AND finalized_tx IS NULL").bind(String(body.tx),room.code).run();
   return json({ok:true});
  }
  if(action==="claim"){
   const p=await requirePlayer(db,req,room),s=await snapshot(db,req,room,now);
   check(room.escrow&&room.finalized_tx&&p.wallet&&s.winners.some(w=>w.id===p.id),"This player has no finalized reward.",403);
   check(!p.claim_tx,"This reward has already been claimed.",409);
   await verifyClaim(String(body.tx),room.escrow,p.wallet,BigInt(room.pool_wei)/BigInt(s.winners.length));
   await db.prepare("UPDATE players SET claim_tx=? WHERE id=? AND claim_tx IS NULL").bind(String(body.tx),p.id).run();return json({ok:true});
  }
  if(action==="refund"){
   await requireHost(req,room);check(room.escrow&&!room.refund_tx,"No refundable contract is available.");
   await verifyRefund(String(body.tx),room.escrow);
   await db.prepare("UPDATE rooms SET refund_tx=?,status=CASE WHEN started_at IS NULL THEN 'cancelled' ELSE status END WHERE code=?").bind(String(body.tx),room.code).run();return json({ok:true});
  }
  throw new ApiError(404,"Route not found.");
 }catch(err){
  if(err instanceof ApiError)return json({error:err.message},err.status);
  if(err instanceof Error&&/UNIQUE constraint|unique constraint|SQLITE_CONSTRAINT/.test(err.message))return json({error:"That name, wallet, or answer is already registered in this battle."},409);
  if(err instanceof Error&&err.message.startsWith("CHAIN:"))return json({error:err.message.slice(6)},400);
  console.error("Battle request failed",err instanceof Error?err.name:"unknown");
  return json({error:"This request could not finish. Please try again."},500);
 }
}
