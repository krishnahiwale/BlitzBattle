# Release status and provenance

This branch is a **post-deadline source publication and documentation handoff**. It copies the application source already deployed before the event's code freeze. It does not introduce new application behavior or redeploy the Worker.

## Versions kept distinct

| Record | Identifier / time |
| --- | --- |
| Original Sites project | `appgprj_6ac9dbb132408191a043cf20936ae1fb` |
| Deployed source commit | `464a552b0f2aa1b186293941b6c61c175e13e7e0` |
| Source commit time | 2026-10-10 10:36:02 UTC / **16:06:02 IST** |
| Successful Sites deployment | `appgdep_6aca153a3a788191b3d7ca804067b841`, 10:36:58 UTC / **16:06:58 IST** |
| Previous Sites source commit | `f8de537bc62dc686816c21a7a16b0f5ceab2f183`, 06:50:22 UTC / **12:20:22 IST** |
| Existing GitHub main at comparison | `d5160051cdbe6499f4b21f7f57350aecf5f6657a` |
| Earlier GitHub source publication | `2758d4ca0a256d65f649cfe7e04e78f169f8b5a4`, **17:12:40 IST** |
| GitHub handoff branch | `release/deployed-site-2026-10-10` |
| App audience changed to public | 2026-10-10 12:48:16 UTC / **18:18:16 IST** |
| Sourcify exact-match verification | 2026-10-10 12:52:11 UTC / **18:22:11 IST** |

The existing GitHub `main` contained an older implementation exported from a different source revision (`d4f50f4af6076aee50d68b62bb257d77599c491c`). Its earlier README described 20-player rooms, configurable round lengths, no speed bonus and a different escrow. Those details do **not** describe the currently deployed app. Its source-provenance notice and full history remain on `main`; this release does not rewrite them or make a blanket claim that all underlying work was created during the event window.

The current deployed source instead has 16-player rooms, fixed 20-second rounds, a speed bonus, a multi-pool Solidity 0.8.28 escrow, and the blocked-cookie session fix. Readers should use this branch's documentation with this branch's code.

## What changed in the handoff

- Copied the deployed snapshot into a separate public release branch, preserving the existing GitHub main history.
- Replaced root README and root submission documentation, and added the `docs/` guides and public evidence records.
- Changed the existing site's audience to public through its access settings.
- Published matching contract source through Sourcify; this did not change the contract or move funds.

No app, API, contract, migration, dependency lockfile, build script or deployed public asset was edited after the freeze for this handoff. The README includes local-only installation configuration steps because the preserved snapshot needs explicit optional-module choices and a transitive `esbuild` binary exposed. These were used during verification, then the tracked configuration was restored byte for byte before publication.

The old `public/submission-guide.md` remains the historical deployed asset. For current event facts, use [JUDGING.md](JUDGING.md), not that older downloadable guide. No application redeployment was performed merely to update a documentation download.

## Integrity and evidence

[Source manifest](evidence/source-manifest.json) lists the deployed source's paths and SHA-256 file hashes. All source files are included; only root `README.md` and `SUBMISSION.md` are replaced by handoff documentation. Additional files are under `docs/`, plus root `CONTRIBUTING.md`.

[On-chain evidence](evidence/onchain.json) records the successful pre-freeze funding receipt, exact bytecode check and source-verification status. [Local smoke result](evidence/local-smoke.json) records the exported build's API check. Public chain data is included; private player credentials and live database rows are not exported.

The event code freeze was **17:30 IST**, and submissions/evidence closed at **17:45 IST**. GitHub publication of this updated branch, its docs, the audience change and Sourcify verification are later. No timestamps have been backdated and no eligibility or score is guaranteed. The owner must check any late-submission policy directly with organizers.
