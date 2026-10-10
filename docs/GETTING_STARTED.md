# Getting started — run BlitzBattle locally

This guide applies to the **recovered original BlitzBattle source** and assumes Node.js 22.13+ and pnpm 11.25.0.

## 1 — Extract and install

Extract `BlitzBattle-GitHub-Ready.zip` (or the original ZIP), open its `BlitzBattle-GitHub-Ready` folder in VS Code, and open a terminal in the same folder as `package.json`. On macOS/Linux and Windows PowerShell:

```bash
node --version
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
```

`pnpm` uses the included `pnpm-lock.yaml`. Do not delete that file or check in `node_modules`.

## 2 — Build server and frontend

```bash
pnpm run build
```

A successful portable build creates `dist/server/wrangler.json`. The project uses Vite/Vinext with Cloudflare's Worker and D1 bindings, not a simple static Vercel SPA.

## 3 — Create the local D1 database once

```bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_grey_champions.sql
```

Only run the SQL migration for a fresh local database. Reapplying it to an existing database can fail. Local DB files are in `.wrangler/state` and must **not** be committed. Use a fresh state directory if resetting a development database.

## 4 — Start the app

```bash
pnpm run dev
```

Navigate to `http://localhost:5173/signin-with-chatgpt?return_to=%2F` and then the app. This local URL activates the **development mock** identity route. Open a practice battle without a wallet. If multiple browser profiles share the same local mock identity, that is normal for this development-only mode.

## 5 — Test the quiz workflow

1. Select AI & Machine Learning, Web3 & Monad or Python & Data.
2. Click **Practice solo**; two **explicitly simulated** opponents appear.
3. Answer five timed questions. Correct answers earn 100 points; there is **no speed bonus**.
4. Read explanations and concept-by-concept personal recap.
5. Create a shared practice room, copy its six-character code and join from a second browser window/profile.
6. As host, start the room; observe the countdown, timed questions, leaderboard and human-only host insights.

## 6 — Run the included checks

```bash
pnpm run check
pnpm run contract:compile
```

`check` covers server/database lifecycle, room authorization, answer timing, wallet ownership and an in-memory EVM for the contract. Solidity recompilation should be necessary only after changing `contracts/BlitzRewards.sol`.

## Common problems

| Problem | Action |
|---|---|
| `pnpm` not found | Install `pnpm@11.25.0`, reopen terminal |
| Missing `dist/server/wrangler.json` | Run `pnpm run build` successfully first |
| `no such table: rooms` | Apply the committed SQL migration once to the same persisted D1 path |
| `DB` binding unavailable | Use the repository's Vite/Cloudflare Worker development scripts; static-file hosting cannot run the API |
| Sign-in redirects in production | Development mock identity is intentionally not a production authentication service; see DEPLOYMENT |
| Wallet network rejected | Only Monad Testnet chain ID 10143 is supported |
| Funding is pending | Wait for transaction confirmation on the explorer; never treat a hash alone as proof |

## Useful files

`app/page.tsx` is the UI; `lib/server.ts` is the API's domain logic; `lib/game.ts` calculates question phases; `lib/questions.ts` holds server-side answer keys; `db/schema.ts` and `drizzle/` manage storage; `contracts/BlitzRewards.sol` is the escrow; `scripts/check-*.mjs` are the test entry points.
