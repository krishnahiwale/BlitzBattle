# Deploy the complete project

## Existing deployment

The current app runs at **https://labelrush-monad.krishh013.chatgpt.site** on ChatGPT Sites with Cloudflare Workers and D1. Its unchanged application source is the deployed snapshot in this release branch. The public GitHub repository is the source distribution; it is not the application server.

The site's audience was set to public on 10 October 2026 at 18:18:16 IST. Check it in a logged-out browser before presenting it to judges. Our non-browser anonymous request hit Cloudflare bot filtering (403 / code 1010); no successful logged-out browser test is claimed. Earlier authenticated production checks exercised the battle-start fix successfully.

The hostname's `labelrush-monad` slug is historical; the running product is BlitzBattle. No custom domain has been configured by this release.

## Why GitHub Pages is insufficient

`app/api/battle/route.ts` needs a Worker runtime and the `DB` D1 binding. Static hosting can serve assets but cannot create persistent multiplayer rooms, validate answers or inspect receipts. Use the existing full-stack deployment or provision a Worker and D1 together.

## Deploy a separate Cloudflare copy

This is an operator recipe for an independent deployment; it was not executed against a second Cloudflare account during this handoff. First complete [local setup](GETTING_STARTED.md), including the explicit install settings, tests and build. A Cloudflare account with Workers/D1 access is required for this path.

```bash
pnpm exec wrangler login
pnpm exec wrangler d1 create blitzbattle
```

Copy the real D1 database UUID returned by the create command. After `pnpm run build`, create a production configuration **beside** the generated Worker configuration so its relative bundle paths remain valid:

```bash
export BLITZ_D1_ID='paste-the-created-database-uuid'
node --input-type=module - <<'JS'
import fs from 'node:fs';
const databaseId = process.env.BLITZ_D1_ID;
if (!databaseId || databaseId === 'paste-the-created-database-uuid') {
  throw new Error('Set BLITZ_D1_ID to your real Cloudflare D1 UUID');
}
const config = JSON.parse(fs.readFileSync('dist/server/wrangler.json', 'utf8'));
config.name = 'blitzbattle';
config.workers_dev = true;
config.d1_databases = [{ binding: 'DB', database_name: 'blitzbattle', database_id: databaseId }];
fs.writeFileSync('dist/server/wrangler.production.json', JSON.stringify(config, null, 2));
JS

# Only for a NEW, EMPTY remote database:
pnpm exec wrangler d1 execute DB --remote --config dist/server/wrangler.production.json --file drizzle/0000_closed_jubilee.sql
pnpm exec wrangler deploy --config dist/server/wrangler.production.json
```

Use the exact public HTTPS URL Wrangler returns. The all-zero UUID in the generated local config is a local placeholder; do not deploy it as a production database binding. Recreate the production config after each build, since build output is generated. Choose another Worker/database name if those names already belong to a different project in your account.

The app uses guest bearer sessions rather than a server wallet. Ordinary play requires no secrets. Wallet private keys remain with participants. The RPC endpoint is configured in `lib/chain.ts`; it must be reachable from browsers and the Worker for reward checks.

The `.openai/hosting.json` project ID records the original Sites project. It does not grant access or contain a secret. Cloning this repository does not authorize someone to publish into that owner's Sites project; use your own deployment account and database for a separate copy.

## Deployment verification

1. Open the public URL while logged out and confirm the app and static assets load.
2. Create a room and join with a second browser profile/device.
3. Start, answer, refresh and finish; confirm scores, recap and host insights.
4. Check that a non-host cannot start the room and that repeat answers are rejected.
5. For rewards, use a funded testnet wallet and keep actual deployment, funding, settlement and claim receipts.
6. Confirm the contract source on the chosen explorer and preserve the displayed verification status.
7. Put the actual live URL and contract links in README. Do not substitute a placeholder address.

## Data and updates

Back up production D1 before schema changes. The included migration creates a new database schema and must not be replayed against an existing one. Use incremental migrations for future versions. Reverting Worker code does not revert database contents or blockchain transactions.

The event code freeze has passed. This release publishes existing app code and new documentation; future feature changes require a clearly dated post-event release rather than rewriting the frozen event record.

References: [Cloudflare D1 commands](https://developers.cloudflare.com/d1/wrangler-commands/), [Wrangler deployment commands](https://developers.cloudflare.com/workers/wrangler/commands/#deploy).
