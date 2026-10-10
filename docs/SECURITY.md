# Security, trust boundaries and known limitations

**Status:** educational hackathon MVP. Do not use real financial assets or infer that local tests equal a formal audit.

## What the prototype implements

- Server-side answer scoring, delayed exposure of correct answers, time-window checks, one answer per question, capacity and uniqueness constraints.
- Host and player tokens stored as SHA-256 hashes in D1 rather than plaintext.
- Wallet ownership verified via room-/player-bound, expiring signed messages; eligible wallet locked before start.
- Monad chain ID checks, confirmed funding/settlement/claim receipts, runtime contract-bytecode verification in backend.
- Solidity allocation state updated **before** external reward transfer in `claim()` and `refund()`; repeat claims blocked.
- Expiration limits and a no-debt settlement path.

## High-priority production blockers

1. **Identity gateway requirement:** `app/chatgpt-auth.ts` and server host authorization depend on `oai-authenticated-user-id` / related headers being inserted by the original ChatGPT Sites authentication gateway. For public standalone hosting, integrate actual login and ensure a trusted proxy **strips all client-supplied identity headers and injects only authenticated values**. The development mock route is insecure for public use. Do **not** expose this as a secure public login without replacing the gateway.
2. **Non-cryptographic winner oracle:** The backend scores, but the host chooses the actual winner array in `finalize`. Users should review the posted winners; future development could introduce signed result attestations/dispute windows.
3. **Wallets ≠ people:** There is no strong identity or anti-sybil mechanism; a wallet signature proves control of that address only.
4. **Unaudited contracts:** `BlitzRewards` lacks independent audit, governance and extensive mainnet risk controls. Use **testnet** only.
5. **Access tokens are credentials:** Host/player tokens in browser state or logs can provide impersonation capability. Do not put them into public repo, screenshots, analytics or URL query strings.
6. **D1 persistence:** Protect the production database and backup process; do not commit `.wrangler/state`, exports or credential files.
7. **Question bank confidentiality:** Answer keys are server-side in code, but this is not cryptographically secret after the full code is open-sourced; a participant could read this public GitHub repository to know all answers. For meaningful judged competitions, curate and rotate questions after publishing.

## Repository safety checklist

- [ ] No `.env` values, wallet seed phrases, private keys, host tokens or player tokens committed.
- [ ] Ignore `node_modules`, `.wrangler/`, `.sites-runtime/`, `.next/`, `dist/`, `.git/`.
- [ ] Development mock authentication disabled or replaced for public hosting.
- [ ] Immutable contract bytecode matches the published source/artifact.
- [ ] No production funds or unsupported claims in marketing/demos.
- [ ] External dependencies and cloud permissions reviewed before public launch.

**Disclosure:** Local tests and a previously hosted private demo do not establish that this repository is independently deployed on Monad Testnet or available publicly now.
