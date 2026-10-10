import {BrowserProvider,Contract,ContractFactory,parseEther,id,type Eip1193Provider} from "ethers";
import artifact from "../contracts/BlitzRewards.json";
declare global{interface Window{ethereum?:Eip1193Provider}}
export const explorer=(hash:string)=>`https://testnet.monadscan.com/tx/${hash}`;
export const addressLink=(address:string)=>`https://testnet.monadscan.com/address/${address}`;
export async function connectWallet(){
 if(!window.ethereum)throw new Error("Open this page in an EVM wallet browser, or use a browser with a wallet extension. Practice mode works without a wallet.");
 const provider=new BrowserProvider(window.ethereum);
 await provider.send("eth_requestAccounts",[]);
 try{await provider.send("wallet_switchEthereumChain",[{chainId:"0x279f"}])}catch(e){
  if(Number((e as {code?:number}).code)!==4902&&Number((e as {info?:{error?:{code?:number}}}).info?.error?.code)!==4902)throw e;
  await provider.send("wallet_addEthereumChain",[{chainId:"0x279f",chainName:"Monad Testnet",nativeCurrency:{name:"MON",symbol:"MON",decimals:18},rpcUrls:["https://testnet-rpc.monad.xyz"],blockExplorerUrls:["https://testnet.monadscan.com"]}]);
  await provider.send("wallet_switchEthereumChain",[{chainId:"0x279f"}]);
 }
 const ready=new BrowserProvider(window.ethereum);
 if(Number((await ready.getNetwork()).chainId)!==10143)throw new Error("Switch your wallet to Monad Testnet.");
 const signer=await ready.getSigner();return {provider:ready,signer,address:(await signer.getAddress()).toLowerCase()};
}
export async function deployRewards(code:string,amount:string,onSubmitted:(tx:string)=>void){
 const {provider,signer}=await connectWallet();const now=Math.floor(Date.now()/1000);
 const c=await new ContractFactory(artifact.abi,artifact.bytecode,signer).deploy(id("BlitzBattle:"+code),now+7200,now+86400,{value:parseEther(amount)});
 const tx=c.deploymentTransaction()!;onSubmitted(tx.hash);
 const receipt=await provider.waitForTransaction(tx.hash,1,90000);
 if(receipt?.status!==1)throw new Error("Funding is not confirmed yet. Retry confirmation using the saved transaction.");return tx.hash;
}
export async function finalizeRewards(address:string,winners:string[],onSubmitted:(tx:string)=>void){
 const {provider,signer}=await connectWallet(),c=new Contract(address,artifact.abi,signer);
 const tx=await c.finalize(winners);onSubmitted(tx.hash);const r=await provider.waitForTransaction(tx.hash,1,90000);
 if(r?.status!==1)throw new Error("Finalization is not confirmed yet. Retry confirmation.");return tx.hash;
}
export async function claimReward(address:string,expectedWallet:string,onSubmitted:(tx:string)=>void){
 const {provider,signer,address:wallet}=await connectWallet();if(wallet!==expectedWallet.toLowerCase())throw new Error("Connect the wallet you verified before the battle.");
 const tx=await new Contract(address,artifact.abi,signer).claim();onSubmitted(tx.hash);const r=await provider.waitForTransaction(tx.hash,1,90000);
 if(r?.status!==1)throw new Error("The claim is not confirmed yet. Retry confirmation.");return tx.hash;
}
export async function refundRewards(address:string,onSubmitted:(tx:string)=>void){const {provider,signer}=await connectWallet();const tx=await new Contract(address,artifact.abi,signer).refund();onSubmitted(tx.hash);const r=await provider.waitForTransaction(tx.hash,1,90000);if(r?.status!==1)throw new Error("The refund is not confirmed yet. Retry confirmation.");return tx.hash}
