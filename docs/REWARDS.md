# Monad Testnet rewards — what the contract actually guarantees

Source: `contracts/BlitzRewards.sol`; ABI+bytecode: `contracts/BlitzRewards.json`; wallet functions: `lib/wallet.ts`; server receipt verification: `lib/chain-server.ts`.

## Why blockchain is involved

Quiz scoring is performed on the application server. Blockchain is used for a different problem: proving that a sponsor has funded a reward, constraining the winner allocations the host submits, preventing repeat claims and recording actual transfers/refunds. **It cannot prove that a quiz result is correct.**

## Funding, play and payout

1. Host creates a room in **Monad** reward mode, proposing a pool of 0.001–1 testnet MON.
2. Host deploys `BlitzRewards` with exact room key and the reward amount as transaction `value`. Wallet pays a separate gas fee.
3. Server checks a **confirmed successful deployment receipt**, deployed bytecode and matching room key, pool, host and funding balance before treating the room as funded.
4. Each player signs a time-limited message identifying room and player. No wallet private key is sent to the server. Wallet eligibility locks when the game starts.
5. After five timed questions, the backend lists eligible players with the top score. All eligible top-score players tie, with no speed bonus.
6. Host calls `finalize(winners)` while finalization remains open. The contract allocates `pool / winners.length` to each unique winner; the backend verifies the emitted event matches its results.
7. Each winner calls `claim()` from their own wallet, and the contract transfers exactly one allocation. Backend checks the confirmed receipt and event.
8. If finalization never happened, the host may refund after its deadline; after finalization, the host can recover unclaimed/rounding remainder **after claim expiry**.

**Deadlines:** the app creates a finalization deadline of about **2 hours after funding** and a claim deadline of **24 hours after funding**. The contract enforces the supplied constructor deadlines; the host cannot finalize or winners cannot claim past their respective time windows.

## Contract functions

| Function | Who calls it | Result |
|---|---|---|
| `constructor(bytes32 key,uint256 finalizeBy,uint256 claimsExpire)` payable | Host | Escrows testnet MON; records deadlines |
| `finalize(address[] winners)` | Host only | Records equal prize allocations for unique winners, once |
| `claim()` | Each listed winner | Zeros allocation before transferring to avoid repeat claims |
| `refund()` | Host only, after applicable deadline | Returns remaining escrow after an expired/unfinalized period |

Events: `Finalized`, `Claimed`, `Refunded`. Per-room deployed address is the transaction `contractAddress` after a successful wallet-signed deployment, **not a hardcoded global address**.

## Network

- Chain: **Monad Testnet**, chain ID **10143** / hexadecimal `0x279f`.
- RPC: `https://testnet-rpc.monad.xyz`.
- Explorer: `https://testnet.monadscan.com`.
- Test token: **testnet MON only**. It has no cash value.

## Limitations

- Host is trusted to finalize honest results; blockchain enforces payments but does not verify learning or anti-cheating.
- Wallet signing does not establish unique human identity; one person may control several addresses.
- Contract is an **unaudited hackathon prototype**. Never use mainnet funds or claim independent smart-contract certification.
- No claim of guaranteed funds should be made until the transaction is confirmed and a corresponding on-chain balance exists.
- If you change Solidity source, rebuild the ABI/bytecode and update any verification process to match the new runtime bytecode exactly.
