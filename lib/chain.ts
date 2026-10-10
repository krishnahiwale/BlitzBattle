export const CHAIN_ID=10143;
export const RPC='https://testnet-rpc.monad.xyz';
export const EXPLORER='https://testnet.monadscan.com';
export const chain={chainId:'0x279f',chainName:'Monad Testnet',nativeCurrency:{name:'Test MON',symbol:'MON',decimals:18},rpcUrls:[RPC],blockExplorerUrls:[EXPLORER]};
export const walletMessage=(origin:string,session:string,code:string,wallet:string)=>`BlitzBattle wallet link\nOrigin: ${origin}\nSession: ${session}\nRoom: ${code}\nWallet: ${wallet.toLowerCase()}\nThis signature links your reward address. It does not authorize a transfer.`;
