# ⚡ BlitzBattle — Learn. Battle. Prove it.

**Five questions. A shared arena. A useful learning recap. Optional rewards on Monad Testnet.**

BlitzBattle is a short multiplayer quiz for college clubs, study groups and developer meetups. A host picks a topic, friends join with a room code, and everyone answers the same timed questions. The leaderboard makes it competitive; explanations and concept insights make it useful after the competition ends.

You can play for free without a wallet. For sponsored battles, a smart contract holds testnet MON and lets winners claim their allocation after the host records the results.

## Open the app and its proof

| Resource | Link |
| --- | --- |
| Live app | [Play BlitzBattle](https://labelrush-monad.krishh013.chatgpt.site) |
| Updated public source | [release/deployed-site-2026-10-10](https://github.com/krishnahiwale/BlitzBattle/tree/release/deployed-site-2026-10-10) |
| Download complete source | [Source ZIP](https://github.com/krishnahiwale/BlitzBattle/archive/refs/heads/release/deployed-site-2026-10-10.zip) |
| Monad Testnet contract | [`0x9fe13a91e3926DE004f7488771Ee909E344fb0C9`](https://testnet.monadscan.com/address/0x9fe13a91e3926DE004f7488771Ee909E344fb0C9#code) |
| Verified contract source | [Sourcify — exact creation and runtime match](https://repo.sourcify.dev/10143/0x9fe13a91e3926DE004f7488771Ee909E344fb0C9) |
| Successful funding transaction | [`0x24cbfa…09040`](https://testnet.monadscan.com/tx/0x24cbfa0320cf7445a0f8bd35584aa88f33d54b95400e3d7dc501c23507b09040) |
| Contract deployment transaction | [`0x13dca6…7d667`](https://testnet.monadscan.com/tx/0x13dca6f1eed4056a643849ff6f0c0208ca1c5b9971c72f8319da40428e87d667) |

**Release status:** this branch publishes the source already deployed at 4:06 PM IST on 10 October 2026, including the battle-start fix. Its GitHub publication and this documentation were prepared **after** the 5:30 PM code freeze and 5:45 PM submission deadline. The existing `main` branch is preserved. This is not a claim that the updated branch was submitted on time. See [release provenance](docs/RELEASE_STATUS.md).

The site's audience was changed to **public** at 6:18 PM IST. A logged-out automated request encountered Cloudflare bot filtering, so a normal logged-out browser visit still needs confirmation. The successful funding transaction occurred at **5:14:21 PM IST**. Sourcify verification completed at **6:22:11 PM IST**. Explorer verification on Monadscan itself has not been independently confirmed.

## What you can do

- **Practice solo:** five questions, your own score and explanations; no wallet or simulated opponents.
- **Host or join a battle:** share a six-character code or invite URL; up to **16 players**.
- **Compete in real time:** a four-second countdown, then five **20-second** questions, with room updates every two seconds.
- **Learn from the result:** review your answers, explanations and the final leaderboard. Hosts also get per-concept learning insights.
- **Keep a record:** revisit battles in the same browser session and download results as JSON.
- **Use optional testnet rewards:** connect and link wallets, deploy or reuse the escrow, fund a room, settle tied winners, claim, recover confirmed receipts, and refund an expired unsettled pool.

Three curated packs are included: **AI & Machine Learning**, **Web3 & Monad**, and **Python & Data**. There is no AI model dependency or paid API key requirement.

## Your first battle

1. Open the [app](https://labelrush-monad.krishh013.chatgpt.site) and choose **Create a battle**.
2. Enter your display name, choose a pack, and leave the optional reward pool off.
3. Share the code with a friend. Use different browser profiles if you are testing both players yourself.
4. As host, select **Start battle** after another player joins. If you are alone, **Start solo practice** starts immediately as a practice room.
5. Answer each question once, then read the recap and inspect the results.

The original start issue came from player identity changing when embedded browsers blocked cookies. The fixed client initializes one session, saves its random bearer token locally, and sends it with every API request. Refreshing keeps the host identity. Old rooms whose session was already lost cannot safely be reassigned; create a fresh room in that case.

### Scoring

A correct answer earns `100 + floor(50 × remaining_ms / 20000)` points, up to 150. A wrong or missed answer earns zero. The server calculates time and score; network delay can affect the speed bonus. All players tied for the highest total share first place. Join order only stabilizes display order.

## Run the complete project locally

Use **Node.js 24** (tested with 24.19.0), **pnpm 11.25.0**, and Git. Linux was tested; Windows users should use WSL2 for the included POSIX test runner. No wallet, Cloudflare account, or secrets are required for ordinary local play.

```bash
git clone --branch release/deployed-site-2026-10-10 https://github.com/krishnahiwale/BlitzBattle.git
cd BlitzBattle
npm install --global pnpm@11.25.0

# Local install settings: decline two optional native optimizations.
pnpm config set --location=project --json allowBuilds '{"bufferutil":false,"esbuild":true,"fsevents":true,"sharp":true,"unrs-resolver":true,"utf-8-validate":false,"workerd":true}'

# Expose the already-locked esbuild binary used by the test runner.
pnpm install --frozen-lockfile --public-hoist-pattern=esbuild
pnpm run build

# Run ONCE for a fresh local database.
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_closed_jubilee.sql

pnpm start --port 8787
```

Open **http://127.0.0.1:8787** after Wrangler prints `Ready`. This runs the built frontend, API and a persistent local D1 database together. Do not reapply the initial SQL to an existing database. The local install-setting command intentionally changes your checkout's `pnpm-workspace.yaml`; the published file remains identical to the deployed source.

For development with live reload, stop the server and run `pnpm dev`; use the URL it prints (normally port 5173). This version does **not** require a mock sign-in to play. Full setup and troubleshooting: [Getting started](docs/GETTING_STARTED.md).

```bash
pnpm run typecheck
pnpm test
pnpm run build
```

These passed on the exported checkout using the setup above: **six service/session tests and one contract integration test**. Read [testing and limitations](docs/TESTING.md) for the exact scope.

## How it works

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Interface | React 19, TypeScript, CSS, Lucide | Lobby, arena, recap, rewards and host insights |
| Build and routes | Vinext/Vite, Next-compatible App Router | Bundle the browser and Worker application |
| Backend | Cloudflare Workers | Validate sessions, joins, answers and reward receipts |
| Storage | Cloudflare D1, SQLite, Drizzle schema | Persist rooms, players and answers |
| Wallet | ethers 6, injected EVM provider | Request signatures and user-approved transactions |
| Escrow | Solidity **0.8.28**, Monad Testnet | Hold pools, record allocations, allow claims and expired refunds |

The backend scores the quiz. The **sponsor attests the winners**. The contract enforces escrow and claim rules, but does not independently verify quiz answers. This is the project's central trust boundary; a dishonest sponsor can bypass the UI and submit a different winner list directly. The app detects a mismatch when registering settlement but cannot reverse an on-chain transaction.

GitHub hosts this repository. The running full-stack application is hosted on **ChatGPT Sites / Cloudflare Workers + D1**. GitHub Pages alone cannot run its API or database.

## Repository map

| Path | What is inside |
| --- | --- |
| `app/page.tsx`, `app/globals.css` | Application screens and visual design |
| `app/api/battle/route.ts` | HTTP API, wallet signatures and on-chain receipt checks |
| `lib/service.ts`, `lib/questions.ts` | Battle rules, scoring and curated question packs |
| `lib/session.ts`, `lib/client-api.ts` | Stable player identity and serialized session initialization |
| `lib/chain.ts`, `lib/contract.json` | Network settings and compiled escrow ABI/bytecode |
| `db/schema.ts`, `drizzle/` | Database schema and included initial migration |
| `contracts/BlitzRewards.sol` | Human-readable escrow source |
| `public/contracts/` | Matching downloadable source and standard JSON verification input |
| `test/`, `scripts/` | Tests, compilation and build tooling |
| `docs/` | Setup, architecture, API, rewards, deployment, security and event evidence |

## Documentation

| Start here if you want to… | Read |
| --- | --- |
| Understand the player and host experience | [User guide](docs/USER_GUIDE.md) |
| Run your own copy | [Getting started](docs/GETTING_STARTED.md) |
| Understand the design and data | [Architecture](docs/ARCHITECTURE.md) |
| Integrate with the backend | [API reference](docs/API.md) |
| Deploy, fund, verify or claim rewards | [Contracts and rewards](docs/REWARDS.md) |
| Host the complete app | [Deployment](docs/DEPLOYMENT.md) |
| Review test coverage and trust boundaries | [Testing](docs/TESTING.md) · [Security](docs/SECURITY.md) |
| Prepare the three-minute pitch and videos | [Demo and social drafts](docs/DEMO.md) |
| Map every judging criterion to evidence | [400-point checklist](docs/JUDGING.md) |
| Understand customers and business hypotheses | [Product strategy](docs/PRODUCT.md) |
| Check what existed before the deadline | [Release status and provenance](docs/RELEASE_STATUS.md) |

## Current limits

This is a hackathon MVP with three public question packs, browser-based identities, and host-attested rewards. It has no anti-Sybil identity system, independent security audit, paid customers, verified demand metrics or mainnet deployment. Clearing browser storage can lose access to an existing host session. Public room state includes player display names and linked wallet addresses.

A real contract and funded pool are evidenced. A completed on-chain settlement/claim, stage transaction, public demo video, social reach and custom domain are **not** claimed. The event's judges decide points and timing eligibility; the repository does not assign itself a score.
