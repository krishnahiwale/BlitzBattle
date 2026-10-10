# Contracts and rewards

Ordinary battles do not need a wallet. A sponsored battle uses **testnet MON**; players pay no entry fee and the app does not offer mainnet transactions.

## Confirmed deployment

| Item | Evidence |
| --- | --- |
| Network | Monad Testnet, chain ID **10143** (`0x279f`) |
| RPC configured in this version | `https://testnet-rpc.monad.xyz` |
| Contract | [`0x9fe13a91e3926DE004f7488771Ee909E344fb0C9`](https://testnet.monadscan.com/address/0x9fe13a91e3926DE004f7488771Ee909E344fb0C9) |
| Deployment transaction | [`0x13dca6…7d667`](https://testnet.monadscan.com/tx/0x13dca6f1eed4056a643849ff6f0c0208ca1c5b9971c72f8319da40428e87d667), identified by Sourcify |
| Funded room | `76GW4Q`, 0.01 test MON |
| Funding receipt | [`0x24cbfa…09040`](https://testnet.monadscan.com/tx/0x24cbfa0320cf7445a0f8bd35584aa88f33d54b95400e3d7dc501c23507b09040), status 1, block 69,816,499 |
| Funding block time | 10 October 2026, **17:14:21 IST** / 11:44:21 UTC |
| Runtime check | `eth_getCode` matched `lib/contract.json.deployedBytecode` byte for byte |
| Source verification | [Sourcify exact creation/runtime match](https://repo.sourcify.dev/10143/0x9fe13a91e3926DE004f7488771Ee909E344fb0C9), **18:22:11 IST**, after deadline |

At the evidence check the pool was unsettled. No successful settlement or claim is claimed. Sourcify forwarded verification to Etherscan/Monadscan; its external verification status could not be checked without an API key. Sourcify success must not be described as an independently checked Monadscan verification badge.

Machine-readable records are in [evidence/](evidence/). These contain public chain data only. See the current [official Monad network documentation](https://docs.monad.xyz/developer-essentials/testnet) and [wallet setup guide](https://docs.monad.xyz/guides/add-monad-to-wallet/testnet).

## Run a funded battle

1. Obtain test MON from the [official faucet](https://faucet.monad.xyz). Leave a little test MON in each transacting wallet for gas.
2. Open **Rewards & proof** in the app. Connect the wallet and accept the switch to Monad Testnet.
3. Either paste the confirmed contract above and select **Save existing**, or select **Deploy on testnet** and confirm a new deployment. The app checks the runtime bytecode before using an address.
4. Create a new battle with **Testnet reward pool** enabled. Invite at least one other player.
5. Every player, including the host, selects **Link reward wallet** and signs the room-bound challenge. Each wallet can be linked only once in that room.
6. The host selects a positive pool amount up to the UI limit of 1 test MON, then **Fund testnet pool**. Confirm the transaction and wait for **Funding verified**. The UI sets a 24-hour deadline.
7. Start and finish all five questions. The host selects **Settle winners**. All top-score ties are included.
8. Each winning player uses the same linked wallet and selects **Claim reward**. **Check my claim** shows the remaining allocation. Keep the real explorer receipt.

If a transaction succeeds on chain but registration fails, use **Recover a confirmed transaction** with the hash. The server will recheck it. Avoid sending a duplicate transaction merely because the browser was interrupted.

## Contract interface and invariants

Source: [`contracts/BlitzRewards.sol`](../contracts/BlitzRewards.sol). One instance supports multiple rooms using `keccak256("BlitzBattle:" + code)` as the pool identifier.

| Function | Who calls it | Rules |
| --- | --- | --- |
| `fund(bytes32 id, uint64 deadline)` payable | Sponsor | Positive pool, nonzero unused ID, deadline 10 minutes–7 days ahead |
| `settle(bytes32 id, address[] winners)` | Original sponsor | Before expiry, once, 1–16 unique nonzero winners, at least one wei per winner |
| `claim(bytes32 id)` | Allocated winner | Pull payment, balance set to zero before transfer, no repeated claim |
| `refund(bytes32 id)` | Sponsor | Only after expiry and only if not settled; closes pool |
| `battles(id)` | Anyone | Read sponsor, pool, deadline and settled flag |
| `claimable(id, wallet)` | Anyone | Read remaining allocation |

Top ties receive equal integer shares; division dust goes to the first winner in stable server order. The whole pool is allocated. **Settled allocations do not expire** and cannot be refunded by the sponsor. The deadline gates settlement/refund, not winner claims. Claim and refund use a reentrancy guard. There is no fee or admin withdrawal function.

## Compile and verify

```bash
pnpm run contract:compile
```

This regenerates `lib/contract.json`, `public/contracts/BlitzRewards.sol` and `public/contracts/compiler-input.json`. Do not replace artifacts for an existing deployment with output from a different compiler configuration.

| Setting | Exact value |
| --- | --- |
| Compiler | `v0.8.28+commit.7893614a` |
| Input | Solidity standard JSON in `public/contracts/compiler-input.json` |
| Contract identifier | `BlitzRewards.sol:BlitzRewards` |
| Optimizer | Enabled, 200 runs |
| EVM target | `paris` |
| Constructor arguments | None |
| Source SPDX | MIT |

Use these settings in the explorer's contract verification form. Sourcify also accepts this standard JSON through its [official v2 verification API](https://docs.sourcify.dev/docs/api/). Verification publishes source; it does not audit safety or certify correct quiz adjudication.

## Trust boundary

The server determines scores, and the sponsor submits winners. Wallet signatures bind the address to an origin, session and room. The API verifies receipts, exact runtime code, event identity, sponsor and server winner set before recording rewards. A sponsor can still call the contract directly with dishonest winners. The contract does not know quiz answers and cannot enforce server honesty.

This is a prototype for testnet use. Mainnet deployment, an independent audit and trust-minimized result attestation are future work, not achieved bonus points.
