# System architecture

## Responsibilities

```text
Browser — React/Next.js UI
 | fetch JSON / room bearer tokens
 v
Next-compatible API routes (`app/api/battles/...`)
 | delegates to
 v
`lib/server.ts` — server-side checks, clock, scoring, room state
 |                         \
 v                          \ verified receipts over RPC
Cloudflare D1 / SQLite       `lib/chain-server.ts` --> Monad Testnet
 rooms, players, answers                                  ^
                                                          |
Browser EVM wallet (`lib/wallet.ts`) ---> BlitzRewards per funded room
```

**Server boundary:** Room questions are generated in `lib/questions.ts` and stored in D1. The API removes unrevealed correct options/explanations until the correct phase. The client does not assign points; it submits a choice, and `lib/server.ts` calculates 100 or 0 points.

**Clock:** `lib/game.ts` determines phases from `started_at` and server time. Sequence: 5-second intro, then each of five questions has a configurable answer window (10/12/15/20 seconds) followed by a 5-second reveal. Refresh preserves progress from D1.

**Room auth:** Host receives a secret host token; participant receives a secret player token. Database stores only hashes of these tokens. Host operations also depend on a trusted `oai-authenticated-user-id` header supplied by the original platform gateway. In any public self-host, clients must never be able to forge the identity header—see [Security](SECURITY.md).

**Blockchain boundary:** The user signs deployment/funding and claim transactions in a wallet. The server confirms the transaction receipt, runtime bytecode, events and matching round metadata before recording it. Scores and chosen winners originate off-chain; the smart contract does not attest quiz correctness.

## Data entities

| Table | Primary purpose | Key fields |
|---|---|---|
| `rooms` | Battle configuration and lifecycle | `code`, `owner_id`, `pack`, `mode`, `seconds`, `started_at`, `escrow`, funding/finalize/refund receipts |
| `players` | Players, bots and reward eligibility | `id`, `room_code`, `name`, hashed token, `bot`, verified `wallet`, claim receipt |
| `answers` | One response per question | `room_code`, `player_id`, `question`, `choice`, `earned`, `submitted_at` |

Unique constraints: name per room; wallet per room; answer per player-question. The room has a capacity of 20 entries. Host topic analytics exclude simulated bots.

## Stack and files

- Vite + Vinext + Next 16 frontend/route compatibility, Cloudflare Workers and D1.
- Ethers 6 client and server library, Solidity 0.8.24 escrow.
- `app/page.tsx`, `app/globals.css`, `app/api/battles/`, `lib/server.ts`, `db/schema.ts` and `contracts/` contain core logic.

## Trade-offs

The design is intentionally optimized for short demo rounds rather than high-stakes competition. It has no strong sybil resistance, no independently audited quiz oracle, and a host-authorized winner submission. The backend remains available to resolve educational outcomes even if a user does not connect a wallet. This separation makes practice usable and preserves the optional nature of on-chain rewards.
