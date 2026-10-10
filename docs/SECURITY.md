# Security and privacy boundaries

## Implemented controls

- Random 256-bit guest bearer tokens; SHA-256 identifiers in game records. The client serializes session initialization and uses a header when embedded-browser cookies are blocked.
- Host checks for start, insights and reward registration; server-side answer timing and scoring; unique participant and answer constraints.
- Same-origin POST checks and bounded request/input lengths.
- Wallet ownership verified with a signed challenge containing origin, session, room and wallet.
- Funding/settlement registration checks a successful receipt, target contract, exact runtime bytecode, matching event, sponsor and server-derived winners.
- Pull claims, checks before external transfers, and a reentrancy guard in the escrow.

## What these controls do not provide

The sponsor is trusted to attest winners and can bypass the frontend. The backend can determine scores. The public question bank can be studied in advance. A person can open multiple browser sessions/wallets. Per-session room limits are not strong global abuse protection. This is not a trustless game, anti-cheat examination platform, independently audited financial product, or mainnet-ready service.

Guest sessions persist in local storage and, when accepted, an HttpOnly cookie. JavaScript access to the header token makes XSS prevention important. Protect dependencies and HTML rendering; do not add unsafe HTML injection. Clearing storage can lose host access. Display names are not proof of identity, and the app must not recover host control by name alone.

## Public and private data

| Data | Visibility |
| --- | --- |
| Room code, title, roster, linked wallets, completed-round scores | Room state is public to anyone who knows its code; recent rooms are listed |
| Final answers/explanations | Available after the battle; also present in the public source bank |
| Individual guest bearer token | Private credential; never include in logs, screenshots or shared links |
| Host session hash | Stored in D1; the hash is distinct from the usable bearer token |
| Chain transactions and wallet addresses | Public blockchain records |
| Local receipts and display name | Stored in the browser; receipts also refer to public chain activity |
| Wallet seed phrase/private key | Never collected by the application |

There is no account recovery, moderation dashboard or automatic data deletion policy in this MVP. Avoid real names if unnecessary. For larger public events, plan abuse controls, retention, moderation and a contract review before making stronger reliability or security promises.

For a suspected issue, contact the repository owner privately through an established channel. Share a minimal reproduction without keys or bearer tokens. Do not test exploitation against other participants' live rooms.
