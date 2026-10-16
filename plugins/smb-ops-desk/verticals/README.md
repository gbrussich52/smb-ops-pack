<!-- Grok Bot, 2026-10-15: Phase 1.6 vertical presets; composition over forked bots (VERTICALS-SPEC §6). -->

# Vertical packs

One Front Desk Ops bot + core skills + thin overlays. Contract: `VERTICALS-SPEC.md` (pack root).

| id | One-liner | Proposal Desk |
| --- | --- | --- |
| `trades` | Electrician, plumber, HVAC, handyman | **on** (line_items) |
| `home-services` | Cleaning, landscaping, junk, pest | **on** (packages) |
| `pro-services` | Consultant, coach, designer | **on** (sow) |
| `salon` | Salon, barber, nail, beauty | **off** (ask) |
| `clinic-frontdesk` | Dental/medical front desk, non-clinical admin only | **refuse** |
| `general` (no folder) | Skip / other | ask |

## Activation (skill layer, no new MCP)
1. Read `vertical_id` from `profile.md`. Missing/`general` → core only.
2. Read `verticals/<id>/PACK.md` → session flags (`proposal_desk`, `proposal_mode`, `service_agreement`, `review_desk`, `recurring_next_actions`).
3. When invoking a core skill, also read `overlays/<skill>.md` if present and apply as extra must / must-not.
4. Switching vertical: confirm → rewrite `vertical_id` → reload. Never wipe the pipeline Sheet.

## Precedence
`ops-safety` > vertical **forbids** > vertical **enables** > core default. Overlays are additive; they never remove core safety.

## Always refused (every vertical)
Leases / landlord docs (→ Lease & Contract Desk, Phase L), clinical PHI / charting, restaurant floor / POS, inventing prices, e-sign, HIPAA / BAA / "compliant" claims.

## clinic-frontdesk warning
**Not** a dental/medical PMS. **Not** HIPAA-compliant. **No BAA.** Activated only after a blocking YES. Metric `clinical_phi_incidents` must stay 0.

## Cap
≤6 packs in v1. Adding a pack needs a spec + goldens, not just a folder.
