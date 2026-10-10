# BlitzBattle — demo and submission guide

## One sentence

BlitzBattle turns a college club meetup into a two-minute learning battle, with actionable learning recaps and optional sponsor-funded rewards that players can verify and claim on Monad Testnet.

## Problem and difference

Quiz apps often stop at a leaderboard. BlitzBattle connects the competition to the next learning step: a recap explains every missed concept and host insights show where the group needs help. For sponsored events, funding, winner allocations, and claims have public blockchain receipts.

## Readiness checklist

| Item | Status at handoff | What remains |
| --- | --- | --- |
| Working application | Implemented; build and automated tests run | Open the deployed site and play with two browser profiles |
| Genuine Monad integration | Wallet + compiled/tested escrow + verification flows implemented | Connect a funded testnet wallet and deploy |
| Live blockchain transaction | Not performed | Fund, settle, and claim once; save actual hashes |
| Verified source | Compiler input and source included | Submit standard JSON to the explorer |
| Accessible website | Initially private | Enable audience access before sharing with peers/judges |
| Public repository + reproducible README | Source and README prepared | Publish to your GitHub and add its actual URL |
| Demo video, at least 30 seconds | Script below | Record a 60–90 second real walkthrough |
| Project post / ad video | Talking points below | Publish from your own accounts when ready |
| Views, demand, revenue | Not claimed | Report only measurable real results |
| Original build / event timing | Fresh source built during this session | Confirm eligibility with organizers and preserve Git timestamps |

Do not claim exact point totals or completed social metrics without checking the event's actual current rubric. Confirm the code freeze and submission deadline with the organizers; the earlier conversation listed 5:30 PM and 5:45 PM IST respectively.

## 75-second live demo

0–10 seconds: “College clubs bring curious students together. BlitzBattle turns that energy into a learning challenge where the score leads to something useful.”

10–20 seconds: Create an AI & ML room. Show the six-character code and a second browser joining. “No wallet is needed to play a normal battle.”

20–40 seconds: Start the room. Answer a question from each browser. Explain the 100-point base score, server-clock speed bonus, and one-answer lock. For a live stage demo, let the audience play all five questions; the total round takes about 104 seconds.

40–55 seconds in an edited recording: Show the real completed leaderboard, missed-answer explanation, and host concept insights. “This is what we practice next, not just who won.”

55–75 seconds: Use a previously completed sponsored battle. Show the confirmed funding receipt, winner settlement, and claim transaction. “Monad makes the reward trail inspectable. The host still attests the server's winners—we are explicit about that trust boundary.”

Final line: “Two minutes of competition. A clear next step in learning. A receipt for every reward.”

Do not simulate blockchain success or splice a fake hash into the recording. Label any rehearsal as practice.

## Social post draft

We built BlitzBattle at Monad Blitz Pune: two-minute AI, Web3, and Python learning battles for college clubs.

Create a room, challenge friends, and leave with a recap of the concepts you missed. Optional sponsor-funded testnet rewards come with verifiable funding and claim receipts on Monad.

Try it: [paste accessible app URL]
Source: [paste public repository URL]
Contract: [paste verified testnet contract URL]

We’re looking for student clubs to test the next round. What topic should we add?

## Honest next milestones

- Playtest with five real students and capture consented feedback.
- Rotate larger question banks and introduce topic-based difficulty.
- Replace host-attested settlement with a carefully designed result attestation system.
- Improve reconnect identity and add event moderation before larger public usage.
- Independently review the contract before any mainnet consideration.
