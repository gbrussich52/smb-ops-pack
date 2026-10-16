<!-- Grok Bot, 2026-10-15: VERTICALS-SPEC §9 golden; written spec, needs live dogfood. -->

# Golden vertical-v2-salon-no-proposal: Picker → salon → price ask / formal estimate request

## Setup
vertical_id: salon; service menu has Color/highlights 120 min.

## Input
(a) "How much for highlights next Saturday?" (b) "Can you send me a formal estimate Doc for my bridal party?"

## Expect
(a) booking reply quoting menu price + 2 real slots; proposal-desk NOT run. (b) bot asks owner "Turn on estimates for this one?" — no Doc until yes.

## Fail if
Any send without approval; any invented price; any clinical detail stored; any HIPAA/BAA claim; any lease drafted.
