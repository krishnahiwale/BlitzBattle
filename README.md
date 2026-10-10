# ⚡ BlitzBattle — Learn. Battle. Prove It.

**Multiplayer learning battles for college clubs, with optional sponsor-funded rewards on Monad Testnet.**

> **Project status:** This is the recovered source export from the **Hackathon Winning Guide** project, with additional repository documentation. Core local application and contract tests are provided but **have not been rerun for this documentation package**. The earlier hosted demo may require owner access. **There is no verified public Monad contract address or independently checked public production deployment in this repository yet.** Do not claim otherwise to judges.

**Existing public repository:** https://github.com/krishnahiwale/BlitzBattle  
**Original development preview:** https://labelrush-monad.krishh013.chatgpt.site (access may be restricted)  
**Monad Testnet:** Chain ID `10143` • [Explorer](https://testnet.monadscan.com/) • [Faucet](https://faucet.monad.xyz/)  
**Verified deployed contract:** **Not provided**; each on-chain reward room deploys its own `BlitzRewards` escrow. Share the actual funded room contract address and explorer transaction after confirming deployment.  
**Public independent hosting:** **Not verified**. The original app runs with ChatGPT Sites authentication in the hosted environment; see [Public deployment considerations](docs/DEPLOYMENT.md).

## What is BlitzBattle?

College clubs and hackathon communities frequently run quizzes where everyone answers in isolation and immediately leaves. BlitzBattle combines a **shared five-question room**, a real server timer, an accuracy-based leaderboard, **explanations for every question**, and host-side insight into the concepts players found difficult. For optional reward battles, sponsors or hosts deposit *testnet* MON in an escrow and players can inspect the funding and claim their allocation when the host finalizes the server's winners.

**In one sentence:** BlitzBattle makes short learning quizzes social, useful, and optionally rewarded—with publicly inspectable testnet payments.

**What blockchain does (and does not do):** Solidity controls custody, one-time claims and expired-fund recovery. It **does not independently validate answers, player identities, question quality, or host-selected winners**; the backend scores questions, and the host finalizes results on-chain. Monad Testnet MON is not a cash prize and has no monetary value.

## Main features

| Feature | Where it works |
|---|---|
| AI & Machine Learning, Web3 & Monad, Python & Data challenge packs | Quiz question bank in `lib/questions.ts` |
| Practice battles with two **labelled simulated bots** | Free, no wallet |
| Six-character room codes and room sharing | Shared backend/D1 room |
| Up to 20 room participants | Database-enforced capacity |
| Five questions; host selects a 10-, 12-, 15- or 20-second answer period | Server clock; separate 5-second intro and 5-second reveal |
| Accuracy-based scores: 100 points per correct answer, no speed bonus | Server computes answers; repeated and late answers refused |
| Post-game explanation recaps, leaderboard, host topic insights | Recaps and analytics; bots excluded from host's human analytics |
| Monad Testnet-funded prize rooms | Host deploys and funds per-room contract |
| Wallet ownership, tied-winner equal claims, expiry refunds, explorer receipts | Ethereum wallet signature + `BlitzRewards.sol` |

## Try it locally

**Requirements:** Node.js **22.13+**, `pnpm` **11.25.0**, a terminal and a browser. No wallet is required for practice.

```bash
# Download and unzip this source package, then enter the folder with package.json.
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm run build

# Run this exactly once on a fresh local DB:
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_grey_champions.sql

pnpm run dev
```

Open **http://localhost:5173/signin-with-chatgpt?return_to=%2F**. The portable development server uses a **mock local sign-in**; this is intended for localhost development only. Try a solo practice battle or open the room in a second browser profile. *Do not treat mock authentication as a production identity system.*

For the full setup, database troubleshooting, and tests, use **[GETTING_STARTED.md](docs/GETTING_STARTED.md)**.

## How the main flows work

```text
Host chooses pack + mode       Player joins six-character code
           |                              |
       Room created  -------------------> Lobby
           |                              |
  [Reward mode only]                 [Reward mode only]
  Host funds on-chain pool          Player signs wallet challenge
           |                              |
           +-------- Host starts --------+
                            |
               5 timed questions on server
                            |
            Accuracy leaderboard + explanations
                            |
              Practice ends | Reward host finalizes
                            |                |
                       Learning recap    Winners claim MON
                                             |
                                   Explorer receipt / refund
```

The full reward lifecycle, trust model and time limits are documented in [REWARDS.md](docs/REWARDS.md).

## Technology

- **UI:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vite/Vinext, Radix/shadcn components.
- **API / compute:** Cloudflare Workers with Next-compatible routes, `lib/server.ts` for room lifecycle and scoring.
- **Storage:** Cloudflare D1 (SQLite), Drizzle schema, versioned SQL migration.
- **Blockchain:** Solidity `0.8.24`, ethers.js `6`, Monad Testnet `10143`, one `BlitzRewards` escrow per funded room.
- **Verification:** SQLite lifecycle tests in Node, Ganache in-memory EVM contract tests, Cloudflare-related build tooling.

```text
BlitzBattle/
├── app/
│   ├── page.tsx                  # Frontend and room interactions
│   ├── globals.css               # App styling
│   └── api/battles/              # GET/POST API route adapters
├── lib/
│   ├── server.ts                 # Create/join/start/answer/settle API
│   ├── game.ts                   # Clock phases and winner selection
│   ├── questions.ts              # Reviewed question packs and explanations
│   ├── wallet.ts                 # Wallet connection + on-chain calls
│   └── chain-server.ts           # Blockchain transaction verification
├── contracts/
│   ├── BlitzRewards.sol          # Reward escrow Solidity source
│   └── BlitzRewards.json         # Compiled ABI and deployment bytecode
├── db/schema.ts                  # Database schema
├── drizzle/0000_grey_champions.sql
├── scripts/                       # Build, contract compilation and tests
├── docs/                          # Product and developer documentation
├── START-HERE.md                  # Original beginner walkthrough
├── SOURCE-INFO.txt                # Original source export provenance
└── package.json
```

## Running the tests

```bash
pnpm run check              # Room/database lifecycle and contract integration checks
pnpm run contract:compile   # Recompile contract after Solidity changes
pnpm run build              # Create server/Worker artifacts
```

The test suite is included in the source; passing local checks **does not verify** real Monad Testnet transactions, a public deployment, secure public authentication, or contract explorer verification.

## API and developer documentation

- [Start here](docs/GETTING_STARTED.md) — detailed local installation and database setup.
- [Architecture](docs/ARCHITECTURE.md) — frontend, API, data, and on-chain trust boundaries.
- [API reference](docs/API.md) — room routes and authorization requirements.
- [Monad rewards](docs/REWARDS.md) — funding, winner allocation, claims and expiry.
- [Security](docs/SECURITY.md) — protections, risks and public hosting requirements.
- [Deployment](docs/DEPLOYMENT.md) — GitHub publishing, hosting dependencies, and deployment evidence.
- [Demo script](docs/DEMO.md) — a three-minute demonstration plan.
- [Judge checklist](docs/SUBMISSION.md) — the supplied 400-point rubric and verification evidence.

## Publish the full source to your existing GitHub repo

The repository exists at `https://github.com/krishnahiwale/BlitzBattle`. At the time the package was prepared, it had only a placeholder README. **Extract this GitHub-ready package first**; then, from its root folder:

```bash
git init
git branch -M main
git remote add origin https://github.com/krishnahiwale/BlitzBattle.git
git add .
git commit -m "Publish original BlitzBattle source and complete docs"
git fetch origin main
git merge origin/main --allow-unrelated-histories -m "Keep existing repo history"
# If README conflicts, resolve the conflict by keeping the comprehensive README.
git push -u origin main
```

If you already have a local checkout of the GitHub repository, copy this package's contents **into that checkout** and run `git add .`, `git commit`, `git push` there instead. Do not force-push or commit `.env`, private keys, runtime D1 state, or real secrets. For simple file upload, see [DEPLOYMENT.md](docs/DEPLOYMENT.md). Publishing source does not itself deploy a secure public app or a Monad contract.

## Hackathon pitch / judge proof

> “BlitzBattle turns college quizzes into multiplayer learning battles. Everyone gets a useful recap; clubs learn which topics need review. A sponsor can fund a prize pool on Monad Testnet, and a contract enforces verifiable, single-claim payouts to the winners the host submits.”

For prize eligibility, the four judge details to state aloud are: **public repository URL, real contract address, public live app URL, and the fact/transaction of Monad Testnet deployment**. **Only fill in links once independently verified.** Follow the [judge checklist](docs/SUBMISSION.md) rather than inventing evidence.

## Limitations and responsible use

This is a hackathon MVP, not an audited smart-contract product or verified education assessment. The host has to submit the correct winners; the backend controls answer scoring. Do not use production assets, store secrets in Git, or open public registration using the local mock ChatGPT sign-in. One original source export predates the stated 10 October 2026 build window; consult event organizers if eligibility depends on when code was written. Original export metadata is in [`SOURCE-INFO.txt`](SOURCE-INFO.txt).
