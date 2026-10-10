# ⚡ BlitzBattle — Learn. Battle. Prove It.

**Five questions. One room. Real learning. Optional rewards on Monad.**

BlitzBattle is a multiplayer quiz app for college clubs, student communities and learning events. Friends join a room, answer five short questions together, check the leaderboard, and leave knowing *why* each answer was right or wrong. A host can also fund a reward battle on Monad Testnet, where eligible winners claim their share from a smart contract.

This started with a simple question: **Why should a college quiz end with just a score?** We wanted to make it competitive, useful for learning and transparent when prizes are involved.

## Try BlitzBattle and explore the code

| Resource | Link / status |
| --- | --- |
| **Public source code** | [GitHub — krishnahiwale/BlitzBattle](https://github.com/krishnahiwale/BlitzBattle) |
| **Original development preview** | [Open development preview](https://labelrush-monad.krishh013.chatgpt.site) — public, logged-out access has **not** been independently confirmed |
| **Independently verified public live app** | **Not yet verified**; do not use the preview as prize-eligibility evidence without testing it |
| **Blockchain network** | **Monad Testnet**, chain ID **10143** |
| **Reward contract address** | **Not yet provided or verified**; BlitzBattle deploys a separate escrow for each funded battle |
| **Explorer** | [Monad Testnet explorer](https://testnet.monadscan.com/) |
| **Three-minute demo guide** | [Preparing for Your Project Demo](docs/DEMO.md) |

We will only add a live contract address, confirmed transaction and verified public URL when we have real evidence. **Testnet MON is for testing, not a real-money prize.**

## What problem does this solve?

Think about a regular college quiz. Someone shares a form, students submit answers, a leaderboard appears, and everyone moves on. It may be competitive, but it rarely helps people understand what they missed.

There is another problem when prizes are involved: participants have to trust the organizer's promise to pay.

**BlitzBattle brings those two pieces together.** The quiz and feedback happen in a fast multiplayer app. Optional sponsor-funded prizes are held by a Monad smart contract, so the funding and payout transactions can be inspected publicly.

## What can you do in the app?

- **Choose your topic:** AI & Machine Learning, Web3 & Monad, or Python & Data.
- **Play without a wallet:** Try a solo practice battle against two clearly labelled simulated players.
- **Host a real room:** Create a battle and share its six-character join code; rooms support up to 20 participants.
- **Race the clock, not each other:** Each battle has five questions. The host can set 10, 12, 15 or 20 seconds per question. Correct answers earn 100 points; there is no speed bonus.
- **Actually learn something:** Read explanations, see the final leaderboard and review the concepts you missed.
- **Understand the group:** Organizers can view topic-level insights to see where participants struggled.
- **Add optional Monad rewards:** In a funded room, players prove control of a wallet, and eligible winners can claim an equal share after the host finalizes the result.

### A typical battle

1. A club host chooses **AI & Machine Learning** and creates a room.
2. Players enter the **six-character code** and wait in the lobby.
3. The host starts the battle. Everyone sees the same five timed questions.
4. The server checks answers and calculates scores.
5. Players see a leaderboard and explanations; the organizer sees learning insights.
6. **Only in a funded reward room:** the host finalizes the eligible winner list and winners claim their allocation on Monad.

A player can learn and compete without needing cryptocurrency. Wallets are needed for the on-chain reward experience.

## Where Monad fits in

We didn't put the entire quiz on a blockchain. Fast question timing, room updates and answer checking belong on the application server. **Monad is used for the part that benefits from public verification: holding and paying the reward pool.**

The **BlitzRewards** smart contract is in [contracts/BlitzRewards.sol](contracts/BlitzRewards.sol).

For each funded room:

1. The host deploys a new **BlitzRewards** contract and sends a prize pool of testnet MON.
2. The application checks the **confirmed contract deployment and funding** rather than trusting a screenshot or an unconfirmed transaction hash.
3. Players sign wallet ownership challenges; they do not give us private keys.
4. The backend scores the quiz and identifies eligible highest scorers.
5. The **host** submits those winners to the contract using **finalize**.
6. Each winner calls **claim** to collect their equal share. A successful claim cannot be repeated.
7. After the applicable deadline, the host can recover remaining funds using **refund**.

**What the contract guarantees:** custody of the funded pool, recorded winner allocations, one-time claims, and time-limited refund rules.

**What it does not guarantee:** it cannot independently check quiz answers or prove the host submitted an honest list. The server scores questions, and the host is trusted to finalize the matching winners. The smart contract has not been independently audited.

Read the [reward flow and trust model](docs/REWARDS.md) for more detail.

## What makes BlitzBattle different?

**Learning after competition.** Every answer has an explanation, so losing a round can still teach you something useful.

**A fairer score.** A correct answer earns the same 100 points regardless of who clicks fastest. Question windows are enforced by the server, not just a browser countdown.

**Sponsor transparency.** If a battle is funded, a student can inspect the escrow and the claim transaction on Monad Testnet.

**Built for small communities.** A club can create a short battle without setting up a huge tournament system. Students join using one code.

**Useful feedback for organizers.** The host can see difficult concepts and use that information to plan a better workshop or study session.

We see potential in student clubs, colleges, developer communities, training programs and sponsored education events. A possible future business model is premium host tools, branded events and sponsor analytics. **This MVP does not claim paying customers or live revenue.**

## Built with

| Part | Technology | Why |
| --- | --- | --- |
| Interface | Next.js, React, TypeScript, Tailwind CSS | Responsive quiz and room experience |
| API and room logic | Cloudflare Workers / Next-compatible routes | Handle joins, answers and server-side game timing |
| Data | Cloudflare D1 (SQLite) and Drizzle | Save rooms, players, answers and results |
| Blockchain | Solidity 0.8.24 and ethers.js | Fund escrow, finalize allocations and claim testnet MON |
| Network | Monad Testnet (10143) | EVM-compatible blockchain transactions |
| Quality checks | Node tests, Ganache test EVM, project scripts | Check game lifecycle and contract behaviour locally |

The main engineering challenge was keeping **quiz state** and **money state** separate. We use the server for scores and a smart contract for payouts. The application is designed to check actual on-chain transaction receipts, not just wallet popups.

### Main source files

| Path | Purpose |
| --- | --- |
| [app/page.tsx](app/page.tsx) | Main app screens and interactions |
| [lib/server.ts](lib/server.ts) | Room and answer API logic |
| [lib/game.ts](lib/game.ts) | Game phases, scores and result rules |
| [lib/questions.ts](lib/questions.ts) | Quiz packs and explanations |
| [lib/wallet.ts](lib/wallet.ts) | Wallet interaction |
| [lib/chain-server.ts](lib/chain-server.ts) | Blockchain receipt checks |
| [contracts/BlitzRewards.sol](contracts/BlitzRewards.sol) | Reward escrow |
| [db/schema.ts](db/schema.ts) | Database tables |
| [drizzle/0000_grey_champions.sql](drizzle/0000_grey_champions.sql) | Local database migration |

## Run it on your computer

You'll need **Node.js 22.13+**, **pnpm 11.25.0**, Git and a browser.

Clone and install:

~~~bash
git clone https://github.com/krishnahiwale/BlitzBattle.git
cd BlitzBattle
npm install --global pnpm@11.25.0
pnpm install --frozen-lockfile
pnpm run build
~~~

Initialize the local Cloudflare D1 database **once** on a fresh setup:

~~~bash
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_grey_champions.sql
~~~

Start the app:

~~~bash
pnpm run dev
~~~

Open this development-only address in your browser:

**http://localhost:5173/signin-with-chatgpt?return_to=%2F**

The recovered project uses a **mock local sign-in** for development. That is not secure public authentication. A production deployment needs a real authentication provider and working Cloudflare Worker/D1 infrastructure; merely uploading the repo to static hosting will not make the complete application work.

Run the included checks:

~~~bash
pnpm run check
pnpm run contract:compile
~~~

These commands are supplied for reproduction; **the full checks were not rerun during this README rewrite**. Detailed help: [Getting Started](docs/GETTING_STARTED.md), [Architecture](docs/ARCHITECTURE.md), [API](docs/API.md), [Security](docs/SECURITY.md), [Deployment](docs/DEPLOYMENT.md).


### Evidence judges need

The Pune V3 judging rules require us to **say these four details aloud**:

- **GitHub:** https://github.com/krishnahiwale/BlitzBattle
- **Live public app:** **Not independently verified yet**
- **Contract:** **No confirmed funded-room contract address supplied yet**
- **Deployment:** **Monad Testnet, chain ID 10143 — actual deployment evidence still required**

A contract address on its own is not proof of explorer verification. A public repository on its own is not a deployed app. We won't claim points for things that haven't been demonstrated.

**Event deadlines (10 October 2026 IST):** code freeze **5:30 PM**; final portal submission and evidence **5:45 PM**; demos **6:00–8:30 PM**. Submit only at [Monad Blitz Pune V3 event portal](https://blitz.devnads.com/events/monad-blitz-pune-v3). **No peer voting.** The judges evaluate against the [official rubric](https://app.notion.com/Judging-Process-Rubrics-Criteria-7366367594f2830e86ed8109e57a498e?pvs=21).

Our full [submission checklist](docs/SUBMISSION.md) covers the basic, advanced and bonus evidence.

## Current limitations

- Source code and documentation are **public**, but a secure, independently hosted production site is **not verified**.
- There is **no confirmed deployed reward-contract address** or successful public Testnet claim to cite here.
- The contract trusts host-submitted winners and has **not** been audited for real-fund use.
- The original exported app relies on development-host authentication. Do **not** expose the localhost mock sign-in as public authentication.
- [SOURCE-INFO.txt](SOURCE-INFO.txt) records that parts of the original source predate the event's build window. **Organizers decide whether that affects eligibility**. We do not represent older work as created during the event.

**BlitzBattle's goal is simple: make every competition worth learning from, and make optional rewards easier to verify.**
