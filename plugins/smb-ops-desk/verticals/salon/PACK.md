<!-- Grok Bot, 2026-10-15: salon pack from VERTICALS-SPEC §3/§4 matrix. -->

# vertical: salon
id: salon
proposal_desk: ask
proposal_mode: none
enables: [price-book, recurring-next-actions]
forbids: [leases, clinical_phi, restaurant_floor, invented_prices, e_sign, hipaa_claims]
stage_emphasis: booked
price_book_template: memories/price-book.template.md

**ICP:** Solo / small salon, barber, nail, beauty — appointment + rebook + review heavy.

## Feature matrix (on / off / ask / refuse / defer)
| Feature | Mode |
| --- | --- |
| Inbox triage | on |
| Lead follow-up | on |
| Calendar booking | on (booking-first) |
| Pipeline CRM | on |
| Morning brief + due scan | on |
| Review ask/reply drafts | on |
| **Proposal Desk / estimates** | **off (ask)** |
| Price book memory | on (service menu, booking copy only) |
| Service-agreement fill | off |
| Recurring-job nextActions | on (rebook) |
| Payments / GBP API / SMS | defer |
| Leases / landlord docs | refuse → Lease & Contract Desk (Phase L) |
| Clinical PHI / charting | refuse |
| Restaurant floor / POS | refuse |

## First win (≤15 min)
Reschedule or new-booking draft + 2 real calendar slots.

## Notes
"How much for X?" → answer from service menu in a booking reply, not an estimate Doc. Med-spa / injectables / clinical treatments → clinic refuse path. No POS/inventory/loyalty.

Pipeline stages unchanged (`new` → `qualified` → `quoted` → `booked` → `done` → `nurture` | `lost`); no new columns.
