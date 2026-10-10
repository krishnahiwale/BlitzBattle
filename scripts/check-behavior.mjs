import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {build} from 'esbuild';
import {Wallet} from 'ethers';
fs.mkdirSync('.sites-runtime/checks',{recursive:true});
await build({entryPoints:['lib/server.ts','lib/game.ts','app/page.tsx'],outdir:'.sites-runtime/checks',bundle:true,platform:'node',format:'esm',jsx:'automatic',external:['ethers','qrcode','react','react-dom','lucide-react']});
const {handleBattleRequest}=await import('../.sites-runtime/checks/lib/server.js');
const {phaseAt}=await import('../.sites-runtime/checks/lib/game.js');
const sqlite=new DatabaseSync(':memory:');
for(const f of fs.readdirSync('drizzle').filter(f=>f.endsWith('.sql')).sort())sqlite.exec(fs.readFileSync('drizzle/'+f,'utf8'));
class Statement{
 constructor(query,values=[]){this.query=query;this.values=values}
 bind(...values){return new Statement(this.query,values)}
 async first(){return sqlite.prepare(this.query).get(...this.values)??null}
 async all(){return {results:sqlite.prepare(this.query).all(...this.values)}}
 async run(){const r=sqlite.prepare(this.query).run(...this.values);return {meta:{changes:Number(r.changes)}}}
}
const db={prepare:sql=>new Statement(sql),batch:async items=>{sqlite.exec('BEGIN');try{const r=[];for(const i of items)r.push(await i.run());sqlite.exec('COMMIT');return r}catch(e){sqlite.exec('ROLLBACK');throw e}}};
let now=1700000000000;
async function call(path='',method='GET',body,token='',owner='owner-one'){
 const req=new Request('https://blitz.test/api/battles'+path,{method,headers:{'Content-Type':'application/json',...(owner?{'oai-authenticated-user-id':owner}:{}),...(token?{Authorization:'Bearer '+token}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});
 const r=await handleBattleRequest(req,db,()=>now);return {status:r.status,body:await r.json()};
}
assert.equal((await call('','POST',{pack:'ai'},'','')).status,401,'anonymous hosts are rejected');
assert.equal((await call('','POST',{pack:'bad'})).status,400);
const created=await call('','POST',{pack:'ai',mode:'practice',title:'AI battle',sponsor:'Test club',seconds:12,bots:true});
assert.equal(created.status,201);const {code,hostToken}=created.body;
let r=await call('/'+code);assert.equal(r.body.phase,'waiting');assert.equal(r.body.question,null);assert.equal(r.body.leaderboard.length,2);assert.ok(r.body.leaderboard.every(p=>p.bot));assert.ok(!('host_hash' in r.body));assert.ok(!('questions' in r.body));
const alice=(await call('/'+code+'/join','POST',{name:'Alice'})).body;
const bob=(await call('/'+code+'/join','POST',{name:'Bob'})).body;
assert.equal((await call('/'+code+'/join','POST',{name:'Alice'})).status,409,'duplicate names rejected');
assert.equal((await call('/'+code+'/start','POST',{},alice.playerToken)).status,403);
assert.equal((await call('/'+code+'/start','POST',{},hostToken,'different-owner')).status,403);
assert.equal((await call('/'+code+'/start','POST',{},hostToken)).status,200);
assert.equal((await call('/'+code+'/start','POST',{},hostToken)).status,409);
assert.equal((await call('/'+code+'/join','POST',{name:'Late player'})).status,409);
assert.equal((await call('/'+code)).body.phase,'countdown');
const qs=JSON.parse(sqlite.prepare('SELECT questions FROM rooms WHERE code=?').get(code).questions);
const start=now;
for(let i=0;i<5;i++){
 now=start+5000+i*17000;
 const before=await call('/'+code,'GET',undefined,alice.playerToken);assert.equal(before.body.phase,'question');assert.equal(before.body.index,i);assert.ok(!('correct' in before.body.question),'answer key is hidden');assert.ok(!('explanation' in before.body.question));
 assert.equal((await call('/'+code+'/answer','POST',{question:i,choice:qs[i].correct,earned:9999},alice.playerToken)).status,200);
 assert.equal((await call('/'+code+'/answer','POST',{question:i,choice:qs[i].correct},alice.playerToken)).status,409,'one answer per question');
 const bChoice=i<2?qs[i].correct:(qs[i].correct+1)%4;
 assert.equal((await call('/'+code+'/answer','POST',{question:i,choice:bChoice},bob.playerToken)).status,200);
 assert.equal((await call('/'+code+'/answer','POST',{question:i+1,choice:0},bob.playerToken)).status,409);
 now=start+5000+i*17000+12000;
 const revealed=(await call('/'+code,'GET',undefined,alice.playerToken)).body;assert.equal(revealed.phase,'reveal');assert.equal(revealed.question.correct,qs[i].correct);
 assert.equal((await call('/'+code+'/answer','POST',{question:i,choice:0},alice.playerToken)).status,409,'late answers rejected');
}
now=start+90000;
const result=(await call('/'+code,'GET',undefined,alice.playerToken)).body;
assert.equal(result.phase,'finished');assert.equal(result.me.score,500,'client-supplied score is ignored');assert.equal(result.me.correct,5);assert.equal(result.recap.length,5);assert.equal(result.winners.length,0,'practice has no wallet rewards');
assert.deepEqual((await call('/'+code,'GET',undefined,alice.playerToken)).body.me,result.me,'refresh restores the same player');
const host=(await call('/'+code,'GET',undefined,hostToken)).body;assert.equal(host.analytics.length,5);assert.equal(host.analytics[0].total,2,'host analytics excludes bots');assert.equal(host.analytics[0].correct,2);assert.equal(host.analytics[4].correct,1);
assert.equal((await call('/'+code+'/finalize','POST',{tx:'0x'},hostToken)).status,409,'practice cannot finalize rewards');
now+=100000;
const reward=(await call('','POST',{pack:'web3',mode:'monad',seconds:10,title:'Reward battle',sponsor:'Sponsor',rewardMon:'0.03',bots:true})).body;
assert.equal((await call('/'+reward.code)).body.leaderboard.length,0,'bots cannot enter reward rooms');
const p1=(await call('/'+reward.code+'/join','POST',{name:'Winner One'})).body;
const p2=(await call('/'+reward.code+'/join','POST',{name:'Winner Two'})).body;
assert.equal((await call('/'+reward.code+'/start','POST',{},reward.hostToken)).status,400,'unfunded room cannot start');
const w1=Wallet.createRandom(),w2=Wallet.createRandom();
for(const [player,wallet]of [[p1,w1],[p2,w2]]){
 const ch=(await call('/'+reward.code+'/wallet-challenge','POST',{},player.playerToken)).body;
 const signed=await wallet.signMessage(ch.message);
 assert.equal((await call('/'+reward.code+'/wallet-verify','POST',{signature:signed},player.playerToken)).status,200);
 assert.equal((await call('/'+reward.code+'/wallet-verify','POST',{signature:signed},player.playerToken)).status,409,'signatures cannot be replayed');
}
// Chain confirmation is tested separately on an in-memory EVM. This fixture isolates server eligibility.
sqlite.prepare('UPDATE rooms SET escrow=?,funding_tx=?,finalize_before=?,claim_until=? WHERE code=?').run('0x'+'1'.repeat(40),'0x'+'2'.repeat(64),now+7200000,now+86400000,reward.code);
assert.equal((await call('/'+reward.code+'/start','POST',{},reward.hostToken)).status,200);
now+=80000;
const tied=(await call('/'+reward.code,'GET',undefined,p1.playerToken)).body;assert.equal(tied.phase,'finished');assert.equal(tied.winners.length,2,'equal eligible scores share the reward');
assert.equal((await call('/'+reward.code+'/wallet-challenge','POST',{},p1.playerToken)).status,409,'eligibility locks when game starts');
const cap=(await call('','POST',{pack:'data',mode:'practice',seconds:12,title:'Capacity test',sponsor:'Test club'})).body;
for(let i=0;i<20;i++)assert.equal((await call('/'+cap.code+'/join','POST',{name:'Player '+i})).status,201);
assert.equal((await call('/'+cap.code+'/join','POST',{name:'Player 21'})).status,409,'capacity enforced in SQL');
assert.equal(phaseAt('live',1000,12,5,6000).phase,'question');assert.equal(phaseAt('live',1000,12,5,18000).phase,'reveal');assert.equal(phaseAt('live',1000,12,5,91000).phase,'finished');
const {renderToString}=await import('react-dom/server');const {createElement}=await import('react');const {default:Home}=await import('../.sites-runtime/checks/app/page.js');
const html=renderToString(createElement(Home));assert.ok(html.includes('Big brain energy.'));assert.ok(html.includes('Try a 90-second demo'));assert.ok(html.includes('AI, unlocked'));assert.ok(html.includes('Web3 first moves'));assert.ok(html.includes('Data brain sprint'));
sqlite.close();console.log('PASS: room lifecycle, auth, hidden answer keys, scoring, late/duplicate answers, refresh, analytics, wallet ownership, eligibility, capacity, and homepage rendering.');
