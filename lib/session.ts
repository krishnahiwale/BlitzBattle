// The opaque bearer is separate from the public, hashed session identifier.
// Header transport keeps identity stable when an embedded browser blocks cookies.
export const SESSION_HEADER = 'X-Blitz-Session';
export const validSessionToken = (value: unknown): value is string =>
 typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

export async function battleIdentity(req: Request) {
 const header = req.headers.get(SESSION_HEADER);
 if (header !== null && !validSessionToken(header)) {
  throw Object.assign(new Error('Invalid player session. Reload the app.'), {status: 401});
 }
 const cookieToken = req.headers.get('cookie')?.split(';').map(x=>x.trim())
  .find(x=>x.startsWith('bb_session='))?.slice(11);
 const token = header || (validSessionToken(cookieToken) ? cookieToken :
  Array.from(crypto.getRandomValues(new Uint8Array(32)),x=>x.toString(16).padStart(2,'0')).join(''));
 const session = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),x=>x.toString(16).padStart(2,'0')).join('');
 return {token,session,cookie:cookieToken===token?null:`bb_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`};
}
