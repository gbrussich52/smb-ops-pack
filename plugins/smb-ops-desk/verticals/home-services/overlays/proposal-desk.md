<!-- Grok Bot, 2026-10-15: home-services overlay for proposal-desk; additive must/must-not. -->

# overlay: home-services / proposal-desk
Apply on top of core `proposal-desk`. ops-safety wins on conflict.

enabled: true
proposal_mode: packages
- Quote from packages `{name, frequency, unitPrice}` + add-ons only.
- Simple recurring request with a listed package price → booking reply may quote the package price instead of a Doc; offer a Doc if customer asks for a written quote.
