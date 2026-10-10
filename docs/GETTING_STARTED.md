# Getting started

BlitzBattle has a browser interface, an API and a database. Run all three locally with the included Cloudflare tooling; opening the HTML alone is insufficient.

## Requirements

- Git, Node.js 24 and pnpm 11.25.0. The release check used Linux and Node 24.19.0.
- A modern browser. Wallet extensions are needed only for the optional reward flow.
- Network access to install dependencies. Local quizzes then use the local database.
- On Windows, use WSL2. The test script invokes the POSIX `node_modules/.bin/esbuild` executable.

The package declares Node >=22.13, but tests use Node's SQLite implementation and Node 24 is the verified setup. A fresh clone selects the portable execution profile automatically.

## Install

```bash
git clone --branch release/deployed-site-2026-10-10 https://github.com/krishnahiwale/BlitzBattle.git
cd BlitzBattle
npm install --global pnpm@11.25.0
pnpm config set --location=project --json allowBuilds '{"bufferutil":false,"esbuild":true,"fsevents":true,"sharp":true,"unrs-resolver":true,"utf-8-validate":false,"workerd":true}'
pnpm install --frozen-lockfile --public-hoist-pattern=esbuild
```

The deployed snapshot's optional native build choices were unresolved. The local configuration command explicitly declines `bufferutil` and `utf-8-validate`; JavaScript fallbacks are sufficient. It retains the declared build permissions for the other dependencies. It changes installation policy in your local checkout, not application behavior. The hoist option exposes a locked transitive `esbuild` binary to the existing test script. Both steps are necessary for this preserved snapshot.

If rerunning installation in non-interactive CI after changing the hoist option, use `CI=true pnpm install --frozen-lockfile --public-hoist-pattern=esbuild`. In a terminal, approve pnpm's prompt to recreate `node_modules` if it appears.

## Build and initialize storage

```bash
pnpm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_closed_jubilee.sql
pnpm start --port 8787
```

Run the SQL command once on a fresh local database. Wait for `Ready on http://127.0.0.1:8787`, then visit that URL. All commands run from the repository root. Stop with Ctrl+C. Restart with `pnpm start --port 8787`; your local rooms remain in `.wrangler/state`.

You do not need to sign in with ChatGPT for this app's quiz routes. The starter includes local auth utilities, but BlitzBattle uses its own guest player session. No `.env` file, private key or API key is needed for ordinary play.

## Check the first battle

1. Create an unsponsored room as the host.
2. Open the same URL in another browser profile or another browser, then join with the code.
3. Start the room from the original profile. Confirm the countdown and first question appear.
4. Answer once and confirm the UI locks the answer. Reload the host profile and confirm ownership remains.
5. After five rounds, inspect the recap. In the host profile, view concept insights and download results.

Tabs in one profile normally share the same player token. Multiple incognito windows can also share one incognito session. Use separate browser profiles for reliable player separation.

## Development commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Vite/Vinext live-reload server, normally port 5173 |
| `pnpm run build` | Produce `dist/client` and `dist/server` |
| `pnpm start --port 8787` | Run the built Worker and local D1 |
| `pnpm run typecheck` | TypeScript checking |
| `pnpm test` | Service/session tests and in-memory EVM contract tests |
| `pnpm run contract:compile` | Rebuild ABI, bytecode, public source and compiler input |
| `pnpm run db:generate` | Generate a new migration after intentionally editing the schema |

Rebuilding the contract is optional for first run: matching artifacts are committed. Do not generate a fresh initial migration just to install the app.

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `ERR_PNPM_IGNORED_BUILDS` | Run the explicit local `allowBuilds` command above, then reinstall. |
| `spawnSync node_modules/.bin/esbuild ENOENT` | Reinstall with `--public-hoist-pattern=esbuild`. |
| Ganache warns about a missing µWS native module | The test runner falls back to JavaScript; check the test's final pass/fail result. |
| `no such table: rooms` | Build, then initialize the same local database using the exact config and persistence path above. |
| `table rooms already exists` | The initial migration has already been applied. Do not repeat it. |
| Connection refused | Wait for Wrangler's `Ready` line and use the printed port. |
| Host button is missing | Use the profile that created the room. If its storage was cleared before the fix, create a fresh room. |
| Sponsored Start is disabled | Join at least two players, link every wallet, and confirm/register funding. |
| Wallet transaction confirmed, app reports an error | Use the room's **Recover a confirmed transaction** form before sending another transaction. |
| Wrong network | Switch the wallet to Monad Testnet, chain ID 10143. |
| Public host returns Cloudflare bot filtering to a script | Test the public URL in an ordinary logged-out browser; do not count script filtering as a successful browser test. |

If asking for help, report the branch/commit, Node/pnpm versions, command, and non-sensitive error text. Never include the player bearer token, seed phrase or private key.
