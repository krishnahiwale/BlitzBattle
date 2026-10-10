# API reference — `/api/battles`

The frontend invokes these JSON endpoints; route adapters are in `app/api/battles/` and behavior in `lib/server.ts`.

**Headers:** `Content-Type: application/json` for POST, `Authorization: Bearer <hostToken-or-playerToken>` for authorized actions. The platform supplies `oai-authenticated-user-id` for hosted, authenticated host actions. **Never send the identity header directly from an untrusted client in a public deployment.**

| Method | Route | Use | Authorization |
|---|---|---|---|
| `GET` | `/api/battles` | List up to 12 recent rooms | Public on reachable app |
| `POST` | `/api/battles` | Create room; returns code and host token | Authenticated host |
| `GET` | `/api/battles/:code` | Current lobby/question/leaderboard/recap snapshot | Optional player/host token |
| `POST` | `/api/battles/:code/join` | Join under a display name; returns player token | Room must be waiting |
| `POST` | `/api/battles/:code/start` | Start question countdown | Host token + host identity |
| `POST` | `/api/battles/:code/answer` | Submit choice for live question | Player token |
| `POST` | `/api/battles/:code/wallet-challenge` | Generate room-bound signed-message challenge | Player token; not yet started |
| `POST` | `/api/battles/:code/wallet-verify` | Verify EIP-191 wallet signature | Player token; valid challenge |
| `POST` | `/api/battles/:code/fund` | Verify actual contract-creation/funding tx and persist address | Host token + identity |
| `POST` | `/api/battles/:code/finalize` | Verify on-chain winner allocation event | Host token + identity |
| `POST` | `/api/battles/:code/claim` | Verify on-chain winner claim event | Player token |
| `POST` | `/api/battles/:code/refund` | Verify host refund event | Host token + identity |

## Examples

Create practice room (request body):

```json
{"pack":"ai","mode":"practice","title":"AI Club Lightning Round","sponsor":"College AI Club","seconds":12,"bots":true}
```

Create reward room (request body):

```json
{"pack":"web3","mode":"monad","title":"Monad Rewards Battle","sponsor":"Sponsor","seconds":20,"rewardMon":"0.03"}
```

Submit an answer while question 0 is open:

```json
{"question":0,"choice":2}
```

Other POST payloads: `join: {"name":"Asha"}`, `wallet-verify: {"signature":"0x..."}`, `fund/finalize/claim/refund: {"tx":"0x...confirmed-transaction-hash"}`. Funding also requires a matching per-room contract deployed from the host wallet. Route `GET :code` intentionally hides future correct answers; explainers appear in reveal/recap.

## Rules and common errors

- Room codes are six characters from the permitted alphabet; each room supports up to 20 entries.
- Supported packs: `ai`, `web3`, `data`. Question timers: 10, 12, 15, 20 seconds.
- Reward pool must be **0.001–1 testnet MON**. Practice has no token pool.
- Incorrect/duplicate/late answers return errors (typically HTTP 409), with no client-side score override.
- Signatures expire after five minutes and cannot be replayed after successful verification.
- Server may return 401 for unauthenticated creation, 403 for insufficient permission, 404 for unknown room, 409 for invalid state/duplicates and 429 for repeated host creation.

**Security note:** The example JSON describes an API contract, not a public unauthenticated API. The existing development host identity scheme needs an approved trusted public authentication gateway before internet-wide deployment.
