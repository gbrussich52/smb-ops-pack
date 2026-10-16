<!-- Grok Bot, 2026-10-15: salon overlay for booking-coordinator; additive must/must-not. -->

# overlay: salon / booking-coordinator
Apply on top of core `booking-coordinator`. ops-safety wins on conflict.

- Booking-first: use `durationMin` from the service menu to size holds; offer 2 real slots.
- Reschedule/cancel → apply `policy-refunds.md` wording verbatim; draft only.
