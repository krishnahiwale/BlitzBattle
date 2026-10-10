# Contributing to BlitzBattle

Use the current release branch and follow [Getting started](docs/GETTING_STARTED.md). Open a small branch for each change. Explain the user-visible problem, the behavior changed, and the verification performed in the pull request.

Run `pnpm run typecheck`, `pnpm test` and `pnpm run build`. Add targeted tests when changing scoring, authorization, timing, identity, schema or escrow behavior. Use two independent browser sessions for multiplayer UI changes. Keep answer checking and score calculation on the server.

Never commit secrets, private keys, player bearer tokens, local databases, node_modules or build output. Public chain receipts can be included when they support a documented test. Keep the Solidity source, compiled artifact and standard JSON input in agreement by running `pnpm run contract:compile` after an intentional contract change.

The October 10 event freeze is already past. New feature work belongs in clearly dated post-event branches/releases. Preserve the original event and deployment records instead of rewriting their dates. Retain the license notices bundled with source files and third-party infrastructure.
