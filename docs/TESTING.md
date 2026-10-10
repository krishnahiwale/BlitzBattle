# Testing and verified scope

The release was checked using Node 24.19.0 and pnpm 11.25.0 on Linux. Run the [documented setup](GETTING_STARTED.md) first, especially the optional native-build policy and `esbuild` hoist setting.

```bash
pnpm run typecheck
pnpm test
pnpm run build
```

## Completed checks

| Check | Result | Scope |
| --- | --- | --- |
| Dependency setup on an exported checkout | Passed with documented settings | Used the pinned lockfile and an available package cache; not a test of downloading every package from the public registry on a new machine |
| TypeScript | Passed | `tsc --noEmit` |
| Service/session integration | 6 passed, 0 failed | Real SQL schema in Node SQLite; deterministic service clock |
| Contract integration | 1 passed, 0 failed | In-memory Ganache EVM, compiled escrow |
| Portable production build | Passed | Browser assets and Cloudflare Worker bundle |
| Fresh local D1 migration | Passed | Five SQL statements, empty local database |
| Built-app HTTP smoke check | Passed | HTML, two separate guest identities, create/join/start, countdown, active question, accepted answer |
| Production start-fix check before this handoff | Passed | Cookieless session retained host identity, solo start and answer through live API |
| Live chain read | Passed | Successful funding receipt and exact runtime bytecode on chain 10143 |
| Source verification | Exact match | Sourcify creation/runtime match at 18:22:11 IST; late evidence |

Local smoke result: [evidence/local-smoke.json](evidence/local-smoke.json).

## What the automated tests cover

`test/battle.test.ts` checks host authorization, scoring, hidden current-round answers, duplicate/late answers, final recap, insights, solo play, ties, capacity, session uniqueness, sponsored readiness, blocked-cookie session recovery, concurrent handshake serialization, legacy cookie adoption, malformed credentials and safe solo conversion.

`test/contract.test.mjs` checks positive funding, duplicate funding rejection, unauthorized settlement, duplicate winners, equal splits including dust, claims, double-claim rejection, expiry, refund and escrow accounting.

The service tests inject a clock so timing boundaries can be checked without waiting through every game. The contract suite uses test accounts on an in-memory chain; it does not spend public testnet funds.

Ganache may print a missing native µWS module warning on Node 24. Its JavaScript fallback ran successfully. An expected server termination after a smoke check is not an application test failure.

## Still requiring human or deployment checks

No automated browser visual/accessibility pass or real multi-device timing study was performed in this environment. Public logged-out access is configured but encountered a bot filter in the script probe. The reward contract has a real funded pool; no public settlement or claim was observed in the captured evidence. There is no proof of a live transaction during the stage demo, organizer acceptance, social publication, views or user demand.

A full manual acceptance pass should create and finish a normal room on two devices, reload the host mid-round, read both recaps, export results, and exercise a complete sponsored fund → settle → claim flow with real testnet wallets. Record genuine failures as well as successes.

The `lint` script is inherited from the starter; lint is not claimed as a passing release gate. TypeScript, the targeted tests and the build are the reported automated gates.
