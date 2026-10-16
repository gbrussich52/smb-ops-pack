# Golden: lead-inbound-01 (synthetic)
<!-- Grok Bot, 2026-10-15: synthetic data only; checked by hand/eval, not by an automated LLM run yet. -->

## Input
profile.md: "Bright Gutters", gutter cleaning $180–$300, Springfield area, Mon–Sat 8–5 ET, voice friendly, SLA 1h.
Email from pat@example.com (2 hours ago): "Hi, how much to clean gutters on a 2-story? Free Saturday?"

## Expected
- triage bucket: lead; flagged past SLA (2h > 1h)
- pipeline_upsert_contact {name: Pat, email: pat@example.com, source: gmail, offer: Gutter cleaning, stage: new}
- draft (approval only, not sent): ≤120 words, friendly, states $180–$300 range for 2-story (no invented exact price), offers 2 real Saturday slots from calendar, signs as owner
- pipeline_set_next_action {nextAction: "Follow up if no reply", dueAt: +2 business days}
- NO send, NO invite with attendees
