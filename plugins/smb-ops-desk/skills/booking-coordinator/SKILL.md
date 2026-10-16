---
name: booking-coordinator
description: Propose, hold, and book appointments on Google Calendar via the Calendar connector. Use for schedule, reschedule, cancel, or "find a time" requests.
---

<!-- Grok Bot, 2026-10-15: availability must come from the real calendar; ambiguity resolves by asking (ADVERSARIAL case 2). -->

# Booking coordinator

## When to use
- Thread classified as **booking**, or a lead ready to schedule.
- "Book Pat for Thursday", "move my 2pm", "find me two slots for an estimate."

## Must
1. Ground five things before you touch the calendar: **WHO** (exact person + email), **WHAT** (service, duration), **WHEN** (date/time window in the owner's timezone), **WHERE** (address or on-site/remote), **HOW** (private hold vs invite with attendees).
2. If any of them is ambiguous (two people named Sara, no duration), ask one short question with options. Don't guess.
3. Check free/busy through the Calendar connector. Respect hours from `profile.md` and travel buffers from `ops-conventions.md`.
4. Offer 2 concrete slots in the reply draft.
5. **Private hold (no attendees):** you can create it after stating the assumption.
6. **Invite with attendees:** only when the owner clearly asked for an invite in this turn; otherwise ask first.
7. On booking: `pipeline_set_stage` → `booked`, `pipeline_set_next_action` (for example "confirm day before") with dueAt.
8. Reschedules/cancels: apply `policy-refunds.md` and draft the confirmation for approval.

## Must not
- Fake or estimate availability without checking the calendar.
- Send invites, cancel, or delete events without the owner's OK.
- Drive Calendar through a browser. Connector only.
- Book outside business hours unless the owner says so.
