<!-- Grok Bot, 2026-10-15: pro-services pack from VERTICALS-SPEC §3/§4 matrix. -->

# vertical: pro-services
id: pro-services
proposal_desk: true
proposal_mode: sow
enables: [proposal-desk, price-book]
forbids: [leases, clinical_phi, restaurant_floor, invented_prices, e_sign, hipaa_claims]
stage_emphasis: quoted
price_book_template: memories/price-book.template.md

**ICP:** Solo consultants, bookkeepers, coaches, designers — booked calls + written proposals.

## Feature matrix (on / off / ask / refuse / defer)
| Feature | Mode |
| --- | --- |
| Inbox triage | on |
| Lead follow-up | on |
| Calendar booking | on |
| Pipeline CRM | on |
| Morning brief + due scan | on |
| Review ask/reply drafts | ask |
| **Proposal Desk / estimates** | **on** |
| Price book memory | on |
| Service-agreement fill | ask |
| Recurring-job nextActions | off |
| Payments / GBP API / SMS | defer |
| Leases / landlord docs | refuse → Lease & Contract Desk (Phase L) |
| Clinical PHI / charting | refuse |
| Restaurant floor / POS | refuse |

## First win (≤15 min)
Lead/inquiry draft; mention a proposal if the ask is SOW-shaped.

## Notes
No legal advice, attorney work product, CPA attestations, or enforceability claims. Patient data for clinics → covered-entity refuse.

Pipeline stages unchanged (`new` → `qualified` → `quoted` → `booked` → `done` → `nurture` | `lost`); no new columns.
