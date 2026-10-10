# Preparing for Your Project Demo — BlitzBattle

**Monad Blitz Pune V3 | 3-minute developer demo | 10 October 2026**

You have three minutes. **The app is the presentation.** Get to a room, let the judges see a real interaction, and show a confirmed Monad Testnet transaction **only if one has actually been completed**.

No slide deck is required, and there is **no peer voting**. Fellow developers and judges want to know: *What does it do? Why Monad? What did you build? What is different?*

## 1. What to prepare before presenting

Keep five browser tabs ready in advance:

1. **BlitzBattle:** home screen with challenge packs.
2. **A prepared room:** a join code, at least one genuine player or clearly labelled practice bot, and a ready-to-play round.
3. **A completed battle:** leaderboard, learning recap and host topic insights, so you don't wait through all five questions.
4. **Monad Testnet explorer:** the real funded-room contract and successful transaction **if deployed and confirmed**.
5. **GitHub README:** https://github.com/krishnahiwale/BlitzBattle.

If you actually have a funded reward room, open the connected **testnet-only** wallet with enough test MON for gas. Never display seed phrases, recovery files or private keys.

**Important:** A wallet popup or an unconfirmed hash is not a successful on-chain demo. Show the explorer receipt with success status. If Testnet deployment is unavailable, say so honestly instead of staging a fake transaction.

## 2. Your exact three-minute script

### 0:00–0:15 — Say what it is

**Show:** BlitzBattle home screen.

**Say:**

“Hi judges! This is **BlitzBattle — Learn. Battle. Prove It.** We built it for college clubs that want more than a quiz score. Students battle together, learn from each answer, and, when a host funds a prize, can claim it through Monad.”

### 0:15–0:45 — Show the battle starting

**Show:** Choose AI, Web3 or Python; open a pre-created room; point to the six-character join code.

**Say:**

“Here I choose a five-question pack and host a room. Friends can join with this six-character code; the room supports up to twenty people. There is also a free solo practice mode, so students don't need a crypto wallet just to learn.”

**Do:** Show a participant in the lobby. If using practice bots, explicitly say they are simulations.

### 0:45–1:25 — Let the judges see gameplay

**Show:** Real question, countdown, answer, score, correct-answer explanation.

**Say:**

“Everyone gets the same timed questions. Our backend owns the question clock and checks each answer, rather than trusting the player's browser. A correct answer scores one hundred points; there is **no speed bonus**. And after the question, we explain the answer instead of just marking it right or wrong.”

**Do:** Submit one answer. You do not need to play all five questions on stage.

### 1:25–1:50 — Show the learning result

**Show:** Prepared finished room, leaderboard, personal recap, host analytics.

**Say:**

“Now look at a completed battle. Students can see their ranking and exactly what they missed. Organizers can also see which topics the group found difficult, so the next workshop can focus on those areas.”

### 1:50–2:35 — The Monad moment

**If an actual funded battle is deployed and a claim or finalization transaction is ready:**

**Show:** Funded room, wallet transaction, Monad Testnet explorer.

**Say:**

“This is where Monad makes the difference. The host funds a reward escrow directly on Testnet, and our app checks the deployment receipt. The server determines the top eligible scorers, then the host finalizes that winner list on the contract. Each winner can claim once. Here is the **real confirmed transaction** and its address on the Monad explorer.”

**Do:** Sign an actual finalize or claim transaction if the state permits it, then show the successful explorer receipt. You cannot claim twice; prepare a fresh, unclaimed allocation if that is your demo action.

**If no actual Testnet deployment is ready, use this accurate alternative:**

**Say:** “The repository includes our Solidity reward escrow, which allocates claims and prevents double claiming. **We have not verified a public funded Testnet deployment yet**, so I won't pretend this is a live transaction. Here's the contract source and the payout flow.”

**Do:** Show the Solidity contract/README instead of claiming a live on-chain result. This does **not** satisfy the live-transaction or deployed-contract judging points.

### 2:35–2:50 — How you built it, and why it is new

**Show:** One architecture diagram or the repository source tree.

**Say:**

“We use React and Next.js for the UI, Cloudflare Workers and D1 for rooms and scoring, and a Solidity contract on Monad for optional prize custody and claims. The interesting design choice is separating fast quiz logic from publicly verifiable payouts. That makes the game responsive without pretending the blockchain grades the answers.”

### 2:50–3:00 — Say the four judging details aloud

**Show:** README, GitHub and explorer in prepared tabs.

**Say, filling in ONLY details that are true:**

“Our public repo is **github.com/krishnahiwale/BlitzBattle**. Our live public URL is **[actual verified live URL]**. Our reward contract address is **[actual deployed address]**. It is deployed on **Monad Testnet, chain ID 10143**, and here is the confirmed transaction.”

**If a detail is missing, say “not yet deployed” or “not yet verified.”** Never read placeholder text aloud as though it were an actual link.

Finish with: **“BlitzBattle makes learning competitive, useful, and transparently rewarded. Thank you!”**

## 3. What makes the product interesting to developers

- **Server-owned quiz timing:** We do not let an untrusted browser decide if a late answer counts.
- **Accuracy over reflexes:** One hundred points for correctness, no speed-based bonus.
- **Separate on-chain reward contracts:** One **BlitzRewards** escrow per funded room.
- **Receipt verification:** The intended funding flow validates a confirmed deployment and contract details rather than assuming that an open wallet popup means success.
- **Clear trust boundary:** The backend scores the quiz; the host submits winners; Solidity enforces allocations, one-time claims and expired-fund refunds.
- **Learning is the takeaway:** We include explanations and organizer insights, not only the winner's score.

Do **not** say “fully decentralized grading” or “fraud-proof quiz.” Those claims are not true for this MVP.

## 4. Backup plan for demo problems

**If Wi-Fi drops:** Play a 30-second+ genuine screen recording of a previously recorded working battle. Keep screenshots of the room, result and (if real) explorer receipt. State that it is a recording.

**If a wallet transaction stalls:** Keep a *previously confirmed* transaction open on the explorer. Say clearly that it was confirmed earlier, not live on stage.

**If the public link requires login:** You need working public auth and a functioning host for the public-site rubric. Do not treat a private or owner-only preview as a verified public deployment.

**If you run out of time:** Skip extra question packs. Prioritize **one real room action, one result, actual Monad proof if available, and the four judging facts**.

## 5. Copyable judging evidence sheet

| Item | Evidence |
| --- | --- |
| Public GitHub | https://github.com/krishnahiwale/BlitzBattle |
| Public app URL | **Not verified** — replace only after testing logged out |
| Real funded-room contract | **Not provided** — paste actual address after confirmed deployment |
| Network | Monad Testnet, chain ID **10143** |
| Successful tx hash | **Not provided** |
| Explorer source verification | **Not confirmed** |
| 30+ second working demo video | Add real published link |
| Creative ad video | Add real published link |
| Social build post | Add post URL and authentic analytics |
| Final portal submission | [Pune V3 event page](https://blitz.devnads.com/events/monad-blitz-pune-v3) |

## 6. Submission rules and timing

- **5:30 PM IST, 10 October 2026:** code freeze. Do **not** modify application or contract code after this.
- **5:45 PM IST:** submission closes. Finalize links, screenshots, posts and qualifying view counts before close. Content posted afterward does not count.
- **6:00–8:30 PM IST:** project demos. Each team gets **three minutes**.
- **No peer voting:** judges evaluate using the [Pune V3 rubric](https://app.notion.com/Judging-Process-Rubrics-Criteria-7366367594f2830e86ed8109e57a498e?pvs=21).

### How to submit

1. Open the [Monad Blitz Pune V3 portal](https://blitz.devnads.com/events/monad-blitz-pune-v3).
2. Select **Submit Project** once available.
3. Put **https://github.com/krishnahiwale/BlitzBattle** in the **GitHub URL** field.
4. Put your **verified public app website** in **Demo URL** (not the repository link).
5. Complete the project details and add the actual Testnet address and relevant evidence wherever the portal provides fields.
6. Submit **before 5:45 PM IST** and verify confirmation. Submission cannot be changed after close.

Keep the event's basic requirements separate: **public GitHub, complete README containing real live URL and contract address, deployed Monad Testnet contract, publicly hosted working app**.

**One final note:** [SOURCE-INFO.txt](../SOURCE-INFO.txt) records an earlier source revision from before the event's stated coding window. Do not claim everything was created during the official window. The organizers determine any eligibility effect.

**Your goal on stage: show something real, explain why it matters, and let the evidence speak for itself.**
