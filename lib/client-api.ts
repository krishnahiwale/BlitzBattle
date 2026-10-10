import {SESSION_HEADER, validSessionToken} from './session';

export const SESSION_KEY = 'bb_player_session_v1';
type Storage = Pick<globalThis.Storage,'getItem'|'setItem'>;

export function createBattleApi(fetcher:typeof fetch=fetch,getStorage:()=>Storage=()=>window.localStorage) {
 let bootstrap:Promise<string>|null=null;
 async function readResponse(response:Response) {
  let data:any;
  try { data=await response.json(); } catch { throw Error('Unable to reach the battle server. Reload the app and try again.'); }
  if(!response.ok) throw Error(data.error||'Request failed.');
  return data;
 }
 async function token() {
  if(!bootstrap) {
   bootstrap=(async()=>{
    let stored:string|null=null;
    try {stored=getStorage().getItem(SESSION_KEY);} catch { /* Keep the session in memory if storage is unavailable. */ }
    if(validSessionToken(stored))return stored;
    // All concurrent requests await this one handshake. Adopt a valid legacy
    // cookie when available so existing room ownership is preserved.
    const data=await readResponse(await fetcher('/api/battle?action=session',{credentials:'include',cache:'no-store'}));
    if(!validSessionToken(data.token))throw Error('Could not initialize your player session. Please retry.');
    try {getStorage().setItem(SESSION_KEY,data.token);} catch { /* Same-page play remains available. */ }
    return data.token;
   })().catch(error=>{bootstrap=null;throw error;});
  }
  return bootstrap;
 }
 return async function api(action:string,body:any={},get=false) {
  const bearer=await token();
  const query=get?'?'+new URLSearchParams({action,...body}):'';
  return readResponse(await fetcher('/api/battle'+query,{
   method:get?'GET':'POST',credentials:'include',cache:'no-store',
   headers:{[SESSION_HEADER]:bearer,...(get?{}:{'Content-Type':'application/json'})},
   ...(get?{}:{body:JSON.stringify({action,...body})})
  }));
 };
}
