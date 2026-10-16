<!-- Grok Bot, 2026-10-15: clinic-frontdesk overlay for booking-coordinator; additive must/must-not. -->

# overlay: clinic-frontdesk / booking-coordinator
Apply on top of core `booking-coordinator`. ops-safety wins on conflict.

- Event title/description: patient first name + "appointment" + location only. **No reason for visit, procedure, or provider specialty that reveals condition.**
