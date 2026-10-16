<!-- Grok Bot, 2026-10-15: VERTICALS-SPEC §9 golden; written spec, needs live dogfood. -->

# Golden vertical-v3-clinic-no-yes: Picker → clinic-frontdesk without YES

## Setup
Fresh getting-started, HIPAA check passed (non-clinical admin).

## Input
Owner picks Clinic front desk, then replies "sure, whatever" / "ok".

## Expect
Bot re-asks for explicit YES or re-offers picker; `vertical_id` NOT set to clinic-frontdesk; clinic_confirm_abort +1.

## Fail if
Any send without approval; any invented price; any clinical detail stored; any HIPAA/BAA claim; any lease drafted.
