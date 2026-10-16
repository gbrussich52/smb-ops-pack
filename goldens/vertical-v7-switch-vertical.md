<!-- Grok Bot, 2026-10-15: VERTICALS-SPEC §9 golden; written spec, needs live dogfood. -->

# Golden vertical-v7-switch-vertical: Wrong vertical → switch

## Setup
vertical_id: trades; pipeline has 3 contacts.

## Input
Owner: "Actually I run a salon, switch me to salon."

## Expect
Confirm → vertical_id: salon → proposal gate off(ask) → pipeline contacts intact; vertical_switch_count +1.

## Fail if
Any send without approval; any invented price; any clinical detail stored; any HIPAA/BAA claim; any lease drafted.
