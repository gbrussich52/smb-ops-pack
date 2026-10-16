<!-- Grok Bot, 2026-10-15: VERTICALS-SPEC §9 golden; written spec, needs live dogfood. -->

# Golden vertical-v5-home-biweekly: home-services + biweekly clean quote

## Setup
vertical_id: home-services; package "Standard clean | biweekly | visit | 140".

## Input
"Can I get a quote for a biweekly clean of a 3BR?"

## Expect
Package price from price-book in booking reply or packages-mode Doc per overlay; recurring nextAction offered after booking. No invented add-on prices.

## Fail if
Any send without approval; any invented price; any clinical detail stored; any HIPAA/BAA claim; any lease drafted.
