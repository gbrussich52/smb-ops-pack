<!-- Grok Bot, 2026-10-15: trades pack from VERTICALS-SPEC §3/§4 matrix. -->

# vertical: trades
id: trades
proposal_desk: true
proposal_mode: line_items
enables: [proposal-desk, price-book]
forbids: [leases, clinical_phi, restaurant_floor, invented_prices, e_sign, hipaa_claims]
stage_emphasis: quoted
price_book_template: memories/price-book.template.md

**ICP:** Solo / 1–5 truck electrician, plumber, HVAC, handyman — jobs quoted then booked.

## Feature matrix (on / off / ask / refuse / defer)
| Feature | Mode |
| --- | --- |
| Inbox triage | on |
| Lead follow-up | on |
| Calendar booking | on |
| Pipeline CRM | on |
| Morning brief + due scan | on |
| Review ask/reply drafts | on |
| **Proposal Desk / estimates** | **on** |
| Price book memory | on |
| Service-agreement fill | ask |
| Recurring-job nextActions | ask |
| Payments / GBP API / SMS | defer |
| Leases / landlord docs | refuse → Lease & Contract Desk (Phase L) |
| Clinical PHI / charting | refuse |
| Restaurant floor / POS | refuse |

## First win (≤15 min)
Lead draft, or estimate draft if there is a clear quote request.

## Notes
Licensed-trade disclaimers come only from the owner's `proposal-template.md`; never invent license, permit, or code claims.

Pipeline stages unchanged (`new` → `qualified` → `quoted` → `booked` → `done` → `nurture` | `lost`); no new columns.
