import { env } from 'cloudflare:workers';
import { battleService } from '@/lib/service';
import { walletMessage, RPC, CHAIN_ID } from '@/lib/chain';
import { Contract, JsonRpcProvider, isAddress, verifyMessage, id, formatEther } from 'ethers';
import artifact from '@/lib/contract.json';
import { battleIdentity } from '@/lib/session';
export const dynamic='force-dynamic';
async function handle(req:Request){
 let cookie:string|null=null;
 try{
 const auth=await battleIdentity(req);cookie=auth.cookie;
 if(req.method==='GET'&&new URL(req.url).searchParams.get('action')==='session'){
  const headers:Record<string,string>={'Cache-Control':'no-store','Vary':'Cookie, X-Blitz-Session'};
  if(cookie)headers['Set-Cookie']=cookie;
  return Response.json({token:auth.token},{headers});
 }
 if(!env.DB) throw Error('Battle database is not connected.');
 const db=env.DB;
 let body:any={};
 if(req.method==='POST'){
  const origin=req.headers.get('origin');
  if(origin!==new URL(req.url).origin) return Response.json({error:'Request origin rejected.'},{status:403});
  const raw=await req.text();if(raw.length>12000)return Response.json({error:'Request is too large.'},{status:413});
  body=JSON.parse(raw);
 }else body=Object.fromEntries(new URL(req.url).searchParams);
 const action=body.action||'home';
 if(req.method==='GET'&&!['home','state','insights'].includes(action))return Response.json({error:'Use POST.'},{status:405});
 let result:any;
 if(['wallet','funding','settlement'].includes(action)){
  const code=String(body.code||'').slice(0,6).toUpperCase();
  const room:any=await db.prepare('SELECT * FROM rooms WHERE code=?').bind(code).first();
  const me:any=await db.prepare('SELECT * FROM players WHERE room=? AND session=?').bind(code,auth.session).first();
  if(!room||!me)throw Error('Join this battle first.');
  if(action==='wallet'){
   if(room.started!==null)throw Error('Wallets are locked after the battle starts.');
   if(!isAddress(body.wallet))throw Error('Invalid wallet address.');
   const address=verifyMessage(walletMessage(new URL(req.url).origin,auth.session,code,body.wallet),body.signature);
   if(address.toLowerCase()!==body.wallet.toLowerCase())throw Error('The signature does not match your wallet.');
   const updated=await db.prepare('UPDATE players SET wallet=? WHERE id=? AND (SELECT started FROM rooms WHERE code=?) IS NULL').bind(address.toLowerCase(),me.id,code).run();
   if(!updated.meta.changes)throw Error('Battle has started; wallet linking is closed.');
   result={ok:true};
  }else{
   if(room.host!==auth.session)throw Error('Only the room host can register reward transactions.');
   if(!isAddress(body.address)||!/^0x[a-fA-F0-9]{64}$/.test(body.tx||''))throw Error('Invalid contract or transaction.');
   if(!room.sponsored)throw Error('This room has no reward pool.');
   const provider=new JsonRpcProvider(RPC,CHAIN_ID,{batchMaxCount:1});
   try{
    if((await provider.getNetwork()).chainId!==BigInt(CHAIN_ID))throw Error('Incorrect network.');
    const receipt=await provider.getTransactionReceipt(body.tx);
    if(!receipt||receipt.status!==1||receipt.to?.toLowerCase()!==body.address.toLowerCase())throw Error('Transaction is not confirmed for this contract.');
    if((await provider.getCode(body.address)).toLowerCase()!==artifact.deployedBytecode.toLowerCase())throw Error('Contract bytecode does not match BlitzRewards.');
    const c=new Contract(body.address,artifact.abi,provider);
    const battle=await c.battles(id('BlitzBattle:'+code));
    if(battle.sponsor.toLowerCase()!==me.wallet||receipt.from.toLowerCase()!==me.wallet)throw Error('Funding must use the host’s linked wallet.');
    const eventName=action==='funding'?'Funded':'Settled';
    const event=receipt.logs.map(l=>{try{return c.interface.parseLog(l)}catch{return null}}).find(e=>e?.name===eventName&&e.args.id===id('BlitzBattle:'+code));
    if(!event)throw Error('Expected battle event was not found in this transaction.');
    if(action==='funding'){
     if(room.started!==null||room.fund_tx)throw Error('This room is already funded or started.');
     if(battle.settled||Number(battle.deadline)*1000<Date.now()+180000)throw Error('Pool is settled or expires too soon.');
     await db.prepare('UPDATE rooms SET contract=?,fund_tx=?,pool=?,sponsor=? WHERE code=? AND started IS NULL AND fund_tx IS NULL').bind(body.address.toLowerCase(),body.tx,formatEther(battle.pool),battle.sponsor.toLowerCase(),code).run();
    }else{
     if(room.contract!==body.address.toLowerCase())throw Error('Use the registered reward contract.');
     const state:any=await battleService(db,auth.session,'state',{code});
     if(!state.finished||!state.winners.length)throw Error('Battle must finish before settlement.');
     const expected=state.winners.map((p:any)=>p.wallet?.toLowerCase()).sort();
     const actual=Array.from(event.args.winners as string[]).map(x=>x.toLowerCase()).sort();
     if(JSON.stringify(actual)!==JSON.stringify(expected))throw Error('Onchain winners do not match the server leaderboard.');
     await db.prepare('UPDATE rooms SET settle_tx=? WHERE code=?').bind(body.tx,code).run();
    }
    result={ok:true};
   }finally{provider.destroy();}
  }
 }else result=await battleService(db,auth.session,action,body);
 const headers:Record<string,string>={'Cache-Control':'no-store'};if(cookie)headers['Set-Cookie']=cookie;
 return Response.json(result,{headers});
 }catch(e:any){
  const headers:Record<string,string>={'Cache-Control':'no-store'};if(cookie)headers['Set-Cookie']=cookie;
  const message=/UNIQUE constraint/.test(e.message)?'That wallet or session is already in this battle.':e.message||'Something went wrong. Try again.';
  console.error('Battle API:',message);
  return Response.json({error:message},{status:e.status||400,headers});
 }
}
export const GET=handle;export const POST=handle;
