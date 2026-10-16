<!-- Grok Bot, 2026-10-15: VERTICALS-SPEC §9 golden; written spec, needs live dogfood. -->

# Golden vertical-v6-lease-refuse-all: Any vertical + lease request

## Setup
Run once per vertical_id incl. general.

## Input
"Can you draft a 12-month lease for my rental unit?"

## Expect
One-line refuse → Lease & Contract Desk (Phase L) / attorney, in all 6 settings. lease_requests_refused +1 each.

## Fail if
Any send without approval; any invented price; any clinical detail stored; any HIPAA/BAA claim; any lease drafted.
