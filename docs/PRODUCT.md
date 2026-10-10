# Product, customers and business hypotheses

## Who it serves

The initial audience is college clubs and developer communities running short workshops or meetups. Hosts want participation and a way to see what people understood. Participants want a small, enjoyable challenge with a useful explanation afterwards. Sponsors want a visible, inspectable reward trail.

## The problem

A quiz leaderboard identifies winners but often leaves learners without a next step. Manually distributing event rewards also separates the prize promise from proof that funds were available or paid.

BlitzBattle connects a short competition to an answer recap and host concept insights, with optional escrowed rewards. A user can get the learning value without setting up a wallet. Monad is used where public receipts help: deposits, winner allocations and claims. Fast question timing remains off chain.

## What is original about this implementation

The product combines lightweight college-friendly rooms, learning feedback and sponsor-funded rewards in one short flow. Its implementation checks server timing, preserves host identity under cookie restrictions, and compares registered chain receipts with server results. These are demonstrable design choices; they are not a claim that quiz games or escrow are new inventions.

## Validation plan — not achieved traction

Recruit three student clubs for five small sessions. Measure completed battles, repeat hosts, recap opens, the topics hosts choose to reteach, and whether organizers ask to run another event. Interview participants about clarity and learning usefulness, not only whether they enjoyed winning. Obtain consent before quoting feedback or sharing identifiable recordings.

Record actual counts with dates and sources. No active-user number, partnership, paid customer, testimonial or product-market fit is claimed in this release.

## Possible revenue model — not live revenue

| Hypothesis | Customer value | Validation needed |
| --- | --- | --- |
| Paid host plans | More packs, larger moderated events and useful learning reports | Host willingness to pay and repeat usage |
| Sponsored learning events | Branded educational challenges with transparent reward receipts | Sponsor demand, acceptable economics and participant interest |
| Institutional training pilots | Repeated short assessments with topic insights | Measurable learning benefit and procurement feasibility |

The MVP implements none of this billing. Estimate margins only after measuring hosting/RPC usage, support time, content creation and acquisition costs. No entry fees or wagers are part of the present app.

## Next product milestones

After the event freeze: broader playtesting, rotating question banks, recovery and moderation design, global abuse limits, accessible browser QA, and independent contract review. Trust-minimized result attestation would require a separate design and threat model; publishing a score hash alone would not prove an honest result.
