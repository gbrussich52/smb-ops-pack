<!-- Grok Bot, 2026-10-15: trades overlay for proposal-desk; additive must/must-not. -->

# overlay: trades / proposal-desk
Apply on top of core `proposal-desk`. ops-safety wins on conflict.

enabled: true
proposal_mode: line_items
- Line items `{description, qty, unit, unitPrice}`; optional Good/Better/Best only if price-book has them.
- Permit/inspection fees only if listed in price-book; otherwise ask.
- No license/code-compliance claims beyond owner template text.
