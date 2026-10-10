# Battle API

Base path: **`/api/battle`**. Responses are JSON with `Cache-Control: no-store`. Mutations use POST with `Content-Type: application/json` and an `Origin` exactly matching the app origin.

## Session setup

Call `GET /api/battle?action=session` once and retain the returned `{ "token": "…" }`. Send the token in `X-Blitz-Session` on later calls. It is a lowercase 64-character hexadecimal bearer credential. Do not log, publish or put it in room URLs. A valid existing `bb_session` cookie is adopted when no header token is supplied. The application client manages this automatically.

Every player needs a distinct session. `home.session` is a public SHA-256 identifier for wallet challenges; it cannot substitute for the token.

## Actions

The body includes `action` plus the fields below. GET reads use query parameters instead.

| Action | Method | Fields | Result / authorization |
| --- | --- | --- | --- |
| `session` | GET | none | Own session token and optional cookie |
| `home` | GET or POST | none | Pack catalog, recent public rooms, caller history, session hash, server time |
| `create` | POST | `name`, `title`, `pack`, optional `practice`, `sponsored` | `{code}`; creator becomes host and player |
| `join` | POST | `code`, `name` | `{code}`; before start, max 16; repeated join for same session is idempotent |
| `state` | GET or POST | `code` | Room, roster, host/me flags, timing, current question, recap and funding |
| `start` | POST | `code`, optional `solo: true` | `{ok:true}`; host only; checks participants and reward readiness |
| `answer` | POST | `code`, `question`, `choice` | `{locked:true}`; member only, current question, one answer |
| `insights` | GET or POST | `code` | Per-question topic, correct, answered and total counts; host after finish |
| `wallet` | POST | `code`, `wallet`, `signature` | `{ok:true}`; member before start; signed room/session/origin challenge |
| `funding` | POST | `code`, `address`, `tx` | `{ok:true}`; host in a sponsored room; confirmed chain checks |
| `settlement` | POST | `code`, `address`, `tx` | `{ok:true}`; host after finish; winners must match server state |

`pack` is `ai`, `web3` or `python`. `question` and `choice` are zero-based integers; choices range 0–3. Names are trimmed to 24 characters and titles to 60. Room codes are normalized to uppercase and six characters. Creating rooms is limited to 30 per host session per hour; this is not a global anti-abuse defense.

## Same-origin browser example

Run from a page on your own local app origin. These calls create a real local practice room.

```js
const { token } = await fetch('/api/battle?action=session').then(r => r.json());
async function battle(action, fields = {}) {
  const response = await fetch('/api/battle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Blitz-Session': token },
    body: JSON.stringify({ action, ...fields })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data;
}
const { code } = await battle('create', {
  name: 'Alex', title: 'Practice', pack: 'ai', practice: true
});
await battle('start', { code });
console.log(await battle('state', { code }));
```

The browser supplies `Origin` automatically. A non-browser client must set the exact origin explicitly for POST. This API is intended for same-origin usage; permissive cross-origin CORS is not enabled.

## State details

`index < 0` means lobby/countdown; inspect `started` to distinguish them. `finished` becomes true after all rounds. `deadline` and `now` are epoch milliseconds. `myAnswer` is the caller's selected option for the current question, or null. `recap` is empty until finish. `players` exposes scores from completed rounds; `winners` includes all top-score ties at finish. A non-member may read state as a spectator but cannot answer or obtain host insights.

`funding` contains `address`, `tx`, `settleTx`, `pool` and `sponsor`. Claim and refund transactions go directly from the wallet to the contract; there are no `claim` or `refund` API actions.

## Error handling

Failures return `{ "error": "Human-readable reason" }`. Common statuses are 400 for invalid input/state, 401 for a malformed session header, 403 for authorization/origin failure, 404 for missing rooms/actions, 405 for a disallowed GET action, 413 for oversized POST data and 429 for room-creation limits. Most chain validation failures are 400. The maximum POST text length is 12,000 characters. Do not infer success from a wallet popup: wait for a receipt and API acknowledgement.
