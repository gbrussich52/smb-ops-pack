---
name: lead-follow-up
description: Draft replies and follow-ups to real leads in the owner's voice, honor the lead response target, and keep nextAction/dueAt current. Use on lead threads and on due actions from the pipeline.
---

<!-- Grok Bot, 2026-10-15: replies to people who wrote in only; cold outreach is a hard v1 non-goal. -->

# Lead follow-up

## When to use
- A thread classified as **lead**.
- `pipeline_list_due_actions` returns items (follow-up scan, morning brief).
- "Reply to that quote request", "follow up with the people who went quiet."

## Must
1. Read the thread plus `profile.md` (offers, prices, area, voice, disqualifiers) and `policy-refunds.md`.
2. Qualify: in area? an offer we sell? a disqualifier? If disqualified, draft a polite decline and set stage `lost` only after the owner approves.
3. Draft the reply in the owner's voice: answer their actual question, give a price range only from `profile.md`, offer a clear next step (2 time slots via booking-coordinator, or one question). Under 120 words unless they asked something detailed.
4. Present it as an approval draft; the owner presses send.
5. Update the pipeline: stage (`new` → `qualified` → `quoted`), `pipeline_log_interaction` direction `outbound` once sent, and `pipeline_set_next_action` with a dueAt that matches the cadence below.
6. Cadence for unanswered leads: nudge after 2 business days, then after 5, then move to `nurture`. Max 3 follow-ups per routine run.

## Must not
- Write to anyone who hasn't contacted the business (no cold email, no lists, no newsletters).
- Nudge when the **owner** owes the lead an answer. Surface that to the owner instead.
- Invent prices, discounts, guarantees, or availability.
- Promise refunds or exceptions outside `policy-refunds.md`. Draft "let me check with [owner]" and escalate.
- Send without an approval card, even if the owner said "send it" earlier in the day.
