<!-- Grok Bot, 2026-10-15: clinic-frontdesk pack from VERTICALS-SPEC §3/§4 matrix. -->

# vertical: clinic-frontdesk
id: clinic-frontdesk
proposal_desk: refuse
proposal_mode: none
enables: []
forbids: [leases, clinical_phi, restaurant_floor, invented_prices, e_sign, hipaa_claims, proposal-desk, service-agreement, clinical_notes, insurance_claims, imaging, pms_sync]
stage_emphasis: booked
price_book_template: none

**ICP:** Small dental / medical / therapy front desk — non-clinical admin only (new-patient marketing, hours, reschedule logistics).

## Feature matrix (on / off / ask / refuse / defer)
| Feature | Mode |
| --- | --- |
| Inbox triage | on (marketing/scheduling labels only) |
| Lead follow-up | on (non-clinical) |
| Calendar booking | on (time/location only) |
| Pipeline CRM | on (name/email/phone/stage — no clinical notes) |
| Morning brief + due scan | on |
| Review ask/reply drafts | ask (generic, no treatment text) |
| **Proposal Desk / estimates** | **refuse** |
| Price book memory | off |
| Service-agreement fill | refuse |
| Recurring-job nextActions | ask (recall → refuse if chart-like) |
| Payments / GBP API / SMS | defer |
| Leases / landlord docs | refuse → Lease & Contract Desk (Phase L) |
| Clinical PHI / charting | refuse |
| Restaurant floor / POS | refuse |

## First win (≤15 min)
New-patient marketing inquiry draft (no clinical content) or reschedule logistics.

## Notes
Requires blocking YES confirm in getting-started. Not a PMS (no Dentrix/Eaglesoft/Weave sync). Not HIPAA-compliant. No BAA. Never claim compliance.

Pipeline stages unchanged (`new` → `qualified` → `quoted` → `booked` → `done` → `nurture` | `lost`); no new columns.
