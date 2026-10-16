<!-- Grok Bot, 2026-10-15: home-services overlay for booking-coordinator; additive must/must-not. -->

# overlay: home-services / booking-coordinator
Apply on top of core `booking-coordinator`. ops-safety wins on conflict.

- After first `booked`, offer a recurring nextAction (e.g. "rebook biweekly") — owner confirms cadence.
- No route optimization / crew dispatch.
