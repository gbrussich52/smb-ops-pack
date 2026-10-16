---
name: review-desk
description: Draft review requests after finished jobs and draft public replies to reviews. Use when a contact moves to done, or when a review notification or pasted review arrives.
---

<!-- Grok Bot, 2026-10-15: v1 is draft-only; GBP API posting is deferred to v1.1 (ITERATE-PLAN Phase 5). -->

# Review desk

## When to use
- A contact hits stage `done`.
- Review notification email, or the owner pastes a review.

## Must
1. **Review ask:** 1 to 2 days after `done`, draft a short thank-you that asks for a review, with the owner's review link from `profile.md` (ask once if missing). Set nextAction "review ask sent?" for the owner's approval.
2. **Positive review (4 to 5 stars):** draft a short, specific thank-you reply of 1 to 2 sentences, without repeating private details.
3. **Negative review (1 to 3 stars):** draft a calm, non-defensive public reply that acknowledges, doesn't argue, and invites them to take it offline. Flag it to the owner at the top of the next brief.
4. Legal threats, safety claims, or anything that names staff: escalate to the owner and don't draft a public reply until they weigh in.
5. Log each draft with `pipeline_add_note`.

## Must not
- Post publicly or reply on Google Business Profile or any platform. The owner posts.
- Argue, blame the customer, or reveal job/price/address details publicly.
- Offer incentives for reviews, or gate reviews (only asking happy customers).
- Invent facts about the job.
