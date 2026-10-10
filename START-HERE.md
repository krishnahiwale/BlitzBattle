# Run BlitzBattle on your computer

This download contains the application source, backend, SQLite/D1 migrations,
Solidity reward contract, compiled ABI/bytecode, dependency lockfile, and tests.
Start with practice mode; it does not require a wallet.

## 1. Extract and open

Extract `BlitzBattle-source.zip`. Open the resulting `BlitzBattle` folder in
VS Code, then open a terminal in that folder. Keep the included hidden files.

Install Node.js 22.13 or newer. The project pins pnpm 11.25.0. If pnpm is not
installed, install that version:

```sh
npm install --global pnpm@11.25.0
```

## 2. Install dependencies and build

```sh
pnpm install --frozen-lockfile
pnpm run build
```

The build creates the local Wrangler database configuration used below. A
fresh source copy automatically uses the portable execution profile. Do not
copy the original checkout's `.sites-runtime` folder into this project.

## 3. Initialize the local database (once)

From the project root, run this command as one line:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_grey_champions.sql
```

This creates the local rooms, players, and answers tables. Do not replay this
migration after it has been applied. Keep `.wrangler/state` to retain your
local rooms between sessions.

## 4. Start the development server

```sh
pnpm run dev
```

Open http://localhost:5173/signin-with-chatgpt?return_to=%2F once. The included
local development sign-in creates a mock local user, then redirects to the
app. It does not require a real ChatGPT login. Use localhost for this flow.

Try an instant practice battle, or create a room and join its code in another
browser profile. The local mock authentication is intended for development
on the same computer. Hosting the app for a public audience requires its own
access and deployment configuration.

Use the development server for this local walkthrough. `pnpm start` runs a
built Worker without the development sign-in middleware; by itself it does
not reproduce the hosted Site's authentication gateway.

## 5. Optional Monad Testnet rewards

Use an injected EVM wallet and testnet MON. Reward rooms use chain ID 10143.
The host deploys and funds a per-room contract from their wallet. Players
verify their wallet before starting. Practice works without any wallet.
No private key, seed phrase, or AI API key is needed in a configuration file.

The host is trusted to submit the winners. The contract is a testnet MVP,
not an audited production escrow. A live wallet transaction still needs
manual verification with a funded wallet.

## Useful commands

```sh
pnpm run check
pnpm run contract:compile
```

`check` exercises the game/backend against SQLite and reward settlement on
an in-memory EVM. Node's SQLite support and Ganache's optional native fallback
may print informational warnings. The precompiled reward artifact is already
included; recompilation is only needed when changing the Solidity contract.

## Main files to edit

- `app/page.tsx`: application screens and interactions.
- `app/globals.css`: styling.
- `lib/questions.ts`: question packs and explanations (server-side).
- `lib/server.ts`: room API, authentication, scoring, and timers.
- `db/schema.ts` and `drizzle/`: database schema and committed migration.
- `lib/wallet.ts` and `lib/chain-server.ts`: wallet and verification flows.
- `contracts/BlitzRewards.sol`: Monad Testnet reward escrow.
- `scripts/check-behavior.mjs` and `scripts/check-contract.mjs`: tests.

Read `README.md` for product features, reward deadlines, and verification limits.

## Export details

This is the existing BlitzBattle demo, not a new build performed at download
time. `SOURCE-INFO.txt` records the source revision and its original commit date.
Only the hosted Site's project identifier was removed from the exported
`.openai/hosting.json`, so the download does not target the existing Site.
Dependencies, deployment credentials, room data, caches, and Git history are
not bundled. Install the locked dependencies using the command above.
