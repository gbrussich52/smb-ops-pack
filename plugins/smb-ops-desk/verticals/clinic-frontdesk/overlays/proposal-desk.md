<!-- Grok Bot, 2026-10-15: clinic-frontdesk overlay for proposal-desk; additive must/must-not. -->

# overlay: clinic-frontdesk / proposal-desk
Apply on top of core `proposal-desk`. ops-safety wins on conflict.

enabled: false (refuse)
- Refuse treatment-plan estimates and procedure quotes: "I can't prepare treatment estimates — that belongs in your practice system." Escalate to owner.
- Public cash-pay consult fee may be quoted in a scheduling reply only if owner supplied it in profile.
