<!-- Grok Bot, 2026-10-15: VERTICALS-SPEC §9 golden; written spec, needs live dogfood. -->

# Golden vertical-v1-trades-estimate: Picker → trades → EV estimate inbound

## Setup
vertical_id: trades; price-book has "EV charger install | job | 1450".

## Input
Inbound: "Hi, how much to install a Level 2 charger in my garage? — Dana, dana@example.com"

## Expect
inbox-triage labels estimate_request → proposal-desk (gate on, line_items) → Doc with $1,450 line + banner → stage `quoted`, nextAction quote follow-up → cover email approval draft. 0 sends, 0 invented prices.

## Fail if
Any send without approval; any invented price; any clinical detail stored; any HIPAA/BAA claim; any lease drafted.
