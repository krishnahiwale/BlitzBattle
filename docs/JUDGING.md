# Judging checklist — 400 available points

This maps the rubric supplied by the project owner to evidence. It records readiness, **not points awarded**. Organizers decide timing eligibility and judges decide scores. No peer voting applies.

## Deadlines and pitch requirements

All times are **IST (UTC+05:30), 10 October 2026**.

| Milestone | Time |
| --- | --- |
| Code freeze | **17:30** — no project code changes afterwards |
| Final submission and evidence | **17:45** — later posts/views do not earn points |
| Three-minute project demos | 18:00–20:30 |
| Judging deliberation | 20:30–20:50 |
| Awards and closing | 20:50–21:00 |

Say all four aloud: **repository link, contract address, live URL, deployment**. Use the real links in [README](../README.md). The updated source publication, public access change and Sourcify verification in this handoff are late; do not represent them as having been completed before 17:45. The funding transaction itself was mined at 17:14:21.

Follow the organizer's [Submission Process](https://monad-foundation.notion.site/p/Submission-Process-9466367594f28285b2ce81b5195f3ee9?pvs=24) and [demo preparation guidance](https://monad-foundation.notion.site/p/Preparing-for-Your-Project-Demo-3256367594f283068d0d81f20c9263d4?pvs=24). Those pages could not be retrieved during this handoff; this checklist uses the owner's pasted rubric. Submit only through the Pune V3 event portal announced by organizers. No submission or late acceptance is claimed.

## Basic — 100

| Criterion | Available | Evidence / remaining work |
| --- | ---: | --- |
| Public GitHub repository | 25 | `krishnahiwale/BlitzBattle` is public. Existing main had a source publication at 17:12:40. This updated release branch was published later; distinguish versions. |
| Proper README with live public page and contract address | 25 | Updated README includes both plus setup and trust boundaries. It is late documentation. |
| Smart contracts deployed on Monad Testnet | 25 | Real contract, exact runtime match, deployment hash and successful pre-freeze funding receipt are documented in [Rewards](REWARDS.md). |
| Project publicly hosted | 25 | Existing Sites deployment; audience changed to public at 18:18:16. Logged-out browser confirmation remains. |

## Advanced: project working — 100

| Criterion | Available | Evidence / remaining work |
| --- | ---: | --- |
| All announced functions working | 25 | Seven tests, TypeScript/build and built-app API smoke pass. Full browser and funded settle/claim acceptance remain. No blanket claim of complete manual validation. |
| Live on-chain transaction during demo | 25 | Historical funding is real. A transaction performed during the actual stage demo has not been evidenced. |
| Contract verified on explorer, source published | 25 | Sourcify exact creation/runtime verification succeeded at 18:22:11. Monadscan submission was forwarded; its verified badge remains unconfirmed. Both timing and explorer acceptance need organizer assessment. |
| Someone else can run it from README without help | 25 | Complete tested commands cover install exceptions, build and local D1. Exported-checkout tests passed; an independent person's run has not been observed. |

## Advanced: build in public — 100

| Criterion | Available | Evidence / remaining work |
| --- | ---: | --- |
| X/LinkedIn post tagging @monad, @monad_dev, @geeky_kartikey | 25 | Draft supplied in [Demo](DEMO.md). No qualifying published post supplied/verified. |
| Social demo video, at least 30 seconds, product running | 25 | Recording plan supplied. No qualifying video URL or publication timestamp supplied. |
| Creative product ad video on social media | 25 | Storyboard supplied. No published ad evidence supplied. |
| 5K+ combined views across event project posts by 17:45 | 25 | No measured view counts or deadline screenshots supplied. Later posts cannot satisfy this deadline. |

## Bonus — 100

| Criterion | Available | Decider | Evidence / remaining work |
| --- | ---: | --- | --- |
| Monad Mainnet contracts | 25 | Organizers | Not deployed by this project flow; app supports Testnet only. |
| Custom domain | 15 | Organizers | Not configured; current URL is a hosted subdomain. |
| Pre-market fit | Up to 20 | Judges | Audience and validation hypotheses documented; no validated traction claimed. |
| Revenue potential and strategy | Up to 20 | Judges | Host plans, sponsored events and institutional pilots are hypotheses in [Product](PRODUCT.md); no live revenue. |
| Innovation and originality | Up to 20 | Judges | Learning recap + host insights + verifiable reward flow can be demonstrated; no unsupported uniqueness claims. |

## Evidence record to maintain

For each completed item, save the URL, exact UTC/IST timestamp, screenshot or receipt, and the applicable source commit. For social metrics, preserve per-post views and the combined total captured by the deadline. Do not mix later posts into that total, invent traffic, backdate commits, or use a historical transaction as proof of a stage transaction.

This release does not submit anything to an event portal or post on social media on the owner's behalf. No numeric score or prize eligibility is asserted.
