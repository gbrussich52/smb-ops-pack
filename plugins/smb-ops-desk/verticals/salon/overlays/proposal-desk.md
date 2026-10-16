<!-- Grok Bot, 2026-10-15: salon overlay for proposal-desk; additive must/must-not. -->

# overlay: salon / proposal-desk
Apply on top of core `proposal-desk`. ops-safety wins on conflict.

enabled: false (ask)
- Do **not** auto-run on "how much for highlights?" — answer from the service menu in a booking reply.
- If the owner/customer explicitly wants a formal estimate Doc (e.g. bridal package): ask the owner "Turn on estimates for this one?" Yes → run proposal-desk for this session with `packages` mode; offer to flip `proposal_desk: true` permanently.
- Med-spa / injectables / clinical treatment → refuse, route to clinic boundaries.
