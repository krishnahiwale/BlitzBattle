import {Contract,FetchRequest,Interface,JsonRpcProvider,type TransactionReceipt} from "ethers";
import artifact from "../contracts/BlitzRewards.json";
const fail=(message:string):never=>{throw new Error("CHAIN:"+message)};
const validTx=(tx:string)=>/^0x[0-9a-fA-F]{64}$/.test(tx);
async function provider(){
 for(const url of ["https://testnet-rpc.monad.xyz","https://rpc.testnet.monad.xyz"]){
  const request=new FetchRequest(url);request.timeout=8000;
  const p=new JsonRpcProvider(request,{chainId:10143,name:"Monad Testnet"},{staticNetwork:true});
  try{if(Number(await p.send("eth_chainId",[]))===10143)return p}catch{p.destroy()}
 }
 return fail("Monad Testnet could not be reached. Keep your transaction hash and retry confirmation.");
}
async function receipt(p:JsonRpcProvider,tx:string){
 if(!validTx(tx))return fail("Enter a valid transaction hash.");
 const r=await p.getTransactionReceipt(tx);
 if(!r||r.status!==1)return fail("This transaction is pending or unsuccessful. Retry after confirmation.");
 return r;
}
async function contract(p:JsonRpcProvider,address:string){
 if(!/^0x[0-9a-fA-F]{40}$/.test(address))return fail("Invalid reward contract address.");
 if((await p.getCode(address)).toLowerCase()!==artifact.deployedBytecode.toLowerCase())return fail("This is not the compiled BlitzBattle reward contract.");
 return new Contract(address,artifact.abi,p);
}
function event(r:TransactionReceipt,address:string,name:string){
 const iface=new Interface(artifact.abi);
 for(const log of r.logs){if(log.address.toLowerCase()!==address.toLowerCase())continue;try{const e=iface.parseLog(log);if(e?.name===name)return e}catch{}}
 return fail("The confirmed transaction does not contain the expected reward event.");
}
export async function verifyFunding(tx:string,key:string,poolWei:string){
 const p=await provider();try{
  const r=await receipt(p,tx);if(!r.contractAddress||r.to!==null)return fail("Use the deployment transaction from Fund battle.");
  const c=await contract(p,r.contractAddress);
  const [host,actualKey,pool,finalizeBy,claimBy,finalized,refunded,balance]=await Promise.all([c.host(),c.roomKey(),c.pool(),c.finalizeBefore(),c.claimUntil(),c.finalized(),c.refunded(),p.getBalance(r.contractAddress)]);
  if(host.toLowerCase()!==r.from.toLowerCase()||actualKey!==key||pool!==BigInt(poolWei)||balance<pool||finalized||refunded)return fail("The contract funding does not match this battle's rules and budget.");
  if(Number(finalizeBy)*1000<Date.now()+180000)return fail("This contract expires too soon. Create a new battle.");
  return {address:r.contractAddress.toLowerCase(),finalizeBefore:Number(finalizeBy)*1000,claimUntil:Number(claimBy)*1000};
 }finally{p.destroy()}
}
export async function verifyFinalization(tx:string,address:string,winners:string[],poolWei:string){
 const p=await provider();try{
  const r=await receipt(p,tx);await contract(p,address);const e=event(r,address,"Finalized");
  const actual=Array.from(e.args[0] as string[],x=>x.toLowerCase()).sort();
  if(actual.join(",")!==winners.map(x=>x.toLowerCase()).sort().join(",")||BigInt(e.args[1])!==BigInt(poolWei)/BigInt(winners.length))return fail("The onchain winner list does not match the server's results.");
 }finally{p.destroy()}
}
export async function verifyClaim(tx:string,address:string,wallet:string,amount:bigint){
 const p=await provider();try{
  const r=await receipt(p,tx);await contract(p,address);const e=event(r,address,"Claimed");
  if(String(e.args[0]).toLowerCase()!==wallet.toLowerCase()||BigInt(e.args[1])!==amount)return fail("This claim receipt does not match the player's allocation.");
 }finally{p.destroy()}
}
export async function verifyRefund(tx:string,address:string){const p=await provider();try{const r=await receipt(p,tx);await contract(p,address);event(r,address,"Refunded")}finally{p.destroy()}}
