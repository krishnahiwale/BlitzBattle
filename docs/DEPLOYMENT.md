# Publishing and deployment — GitHub, Cloudflare D1 and Monad

## What is already available and what is not

- The GitHub repo **already exists and is public**: https://github.com/krishnahiwale/BlitzBattle. At the time this source package was assembled, it contained only a short README; the source must be pushed.
- The original BlitzBattle project had a **ChatGPT Sites-hosted development app**. That is **not equivalent to an independently accessible production website**. Do not claim the demo URL meets the public-hosting rubric without checking in a logged-out browser.
- The source does **not** contain a real deployed Monad contract address. The contract is deployed **per funded room**, and its on-chain address is in the actual funding transaction receipt.

## A — Push full files to GitHub

Use a terminal with Git installed and authenticated. Easiest safe method: clone the existing repo, then copy **the contents** of this source package into that checkout, keeping `.git` from the checkout:

```bash
git clone https://github.com/krishnahiwale/BlitzBattle.git
cd BlitzBattle
# Copy all files from the downloaded BlitzBattle-GitHub-Ready folder into this checkout,
# including .github and the application folders, then:
git status
git add .
git commit -m "Add BlitzBattle app, Solidity escrow and full project docs"
git push origin main
```

Alternatively initialize in the extracted source folder and merge existing README history first (instructions in root README). **Never force-push as a shortcut.** If code freeze has already passed, do not push any code changes in violation of event rules.

## B — Run the project locally

Follow [GETTING_STARTED.md](GETTING_STARTED.md); the project uses Cloudflare D1-backed server routes and **cannot run as static HTML alone**. For public hosting, a Cloudflare Worker or other environment that implements its runtime APIs, persistent database binding, and authentication is necessary.

## C — Public production hosting (requires engineering/configuration)

This recovered export uses a **ChatGPT Sites-specific auth gateway**, local development identity shim and integration build plugins. A direct Vercel import, GitHub Pages upload, or Cloudflare deploy **is not guaranteed** to work securely without adapting the runtime:

1. Establish a trusted public login (e.g. properly implemented OAuth) and change the host authorization so clients cannot set `oai-authenticated-user-id` themselves.
2. Provision a production D1 database and Worker binding `DB`; apply `drizzle/0000_grey_champions.sql` **once** to the production database.
3. Configure Worker compat flags/runtime and deploy a Worker artifact from a verified production build; use Cloudflare's current deployment docs for the precise CLI steps.
4. Use HTTPS and validate cross-device room joins, API, D1 persistence, authentication, funding/claim flows.
5. Record the actual, **logged-out-accessible** website URL. Do not use a private owner-only ChatGPT Sites URL as public-host evidence.

A production deployment is **not completed** by this documentation package. Code modifications and actual account access are needed for public self-hosting. A public GitHub URL and a source ZIP by themselves do not fulfill the website points.

## D — Confirm on Monad Testnet

Use a disposable wallet with testnet MON only. Create a reward room, sign and deploy the escrow, wait for a confirmed successful transaction, and record:

- Deployment transaction hash and deployed `BlitzRewards` contract address.
- Network `Monad Testnet` (10143) and [explorer page](https://testnet.monadscan.com).
- One actual successful claim transaction, if you can complete a test round.
- Source verification status as explicitly shown by the explorer (deploying does not automatically verify source).

**Per-room escrows:** You may present one funded demonstration room's contract address. Do not invent a global address; the original design instantiates a new contract for each reward battle. Contract verification requires matching Solidity compiler **0.8.24**, code and settings from its actual build; compilation is driven by `scripts/compile-contract.mjs`. Use the exact build's inputs/output rather than guessing optimizer/EVM settings.

## E — Evidence pack for rubric

Public GitHub link, independently reachable site, real deployed contract/explorer verification page, successful real transaction hash, clean README run from fresh checkout, social post URLs and timestamps, 30-second demo, creative ad, view evidence and submission confirmation. See [SUBMISSION.md](SUBMISSION.md).
