---
name: inbox-triage
description: Classify and summarize new Gmail and propose one next action per thread. Use when new mail arrives, on "check my inbox", or inside the morning brief.
---

<!-- Grok Bot, 2026-10-15: classification + proposal only; outbound happens through lead-follow-up/booking/review drafts. -->

# Inbox triage
<!-- Grok Bot, 2026-10-15: v1.1 Proposal Desk patch (estimate_request handoff / ask-vs-act / Doc URL on quoted). -->

## When to use
- "Check my inbox", "anything new?", "what did I miss?"
- Morning brief and follow-up scan.

## Must
1. Read through the Gmail connector (search, then read threads). Default window: since the last triage, or 24 hours.
2. Put each thread in exactly one bucket:
   - **lead**: a new person asking about price, availability, or a service
   - **estimate_request**: a lead or existing customer asking for a quote, estimate, or proposal on a specific job, or replying to/changing a proposal (a subtype of lead: still upsert like a lead)
   - **booking**: schedule, reschedule, cancel, or confirm an appointment
   - **review**: a review notification, review mention, or complaint about past work
   - **vendor**: suppliers, invoices to you, tools, platforms
   - **spam**: unsolicited pitches, phishing, newsletters you didn't ask for
   - **other**: everything else, including personal mail
3. For each lead/booking/review give a one-line summary (who, what, urgency) and one proposed action that points to the right skill: lead-follow-up, proposal-desk (estimate_request), booking-coordinator, or review-desk. Do not quote prices in triage; proposal-desk prices from `price-book.md` only.
   Lease / tenant / rental-agreement requests go to **other** with the note "out of scope: leases". Never route them to proposal-desk.
4. Upsert leads to the pipeline (`pipeline_upsert_contact`, source `gmail`) and `pipeline_log_interaction` direction `inbound`. If the pipeline is down, keep going and say "pipeline didn't update."
5. Flag anything past the owner's lead response target at the top.
6. Keep it short: counts per bucket, then lead/booking/review details. Collapse vendor/spam/other into one line.

## Must not
- Send, auto-reply, forward, archive in bulk, or delete mail.
- Mark spam or unsubscribe without the owner saying so.
- Open links or attachments from unknown senders beyond what's needed to classify.
- Paste full customer threads into memories.
