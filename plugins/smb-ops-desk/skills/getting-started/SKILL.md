---
name: getting-started
description: First-session setup for Front Desk Ops. Use on first run or when the owner says "set me up". Connects Gmail then Calendar one at a time, runs a short interview, creates the pipeline sheet and two routines, and delivers a first win in under 15 minutes.
---

<!-- Grok Bot, 2026-10-15: encodes SPEC §4 journey; one question at a time is the main defense against setup drop-off (ADVERSARIAL §1.1). -->

# Getting started
<!-- Grok Bot, 2026-10-15: v1.1 Proposal Desk patch (estimate_request handoff / ask-vs-act / Doc URL on quoted). -->

## When to use
- First session after installing the template or the `smb-ops-desk` plugin.
- Owner says "set me up", "start over", or "connect my inbox".
- Re-run: be idempotent. Reuse existing connectors, memories, sheet, and routines; only fill gaps.

## Must
1. **Open with one line:** "I'm your front desk: I sort your inbox, draft replies for you to approve, book on your calendar, and keep a simple lead list. Nothing gets sent without your OK."
2. **Scope check (one line, before anything else):** "If you're a HIPAA covered entity handling patient health info, stop here. This pack isn't for clinical PHI." If they confirm they are, stop the setup politely.
2b. **Vertical picker (one question, ~60s)** <!-- Grok Bot, 2026-10-15: Phase 1.6 picker per VERTICALS-SPEC §5 -->. Only after the HIPAA check passes. Ask: "What kind of business is this? Pick one — I'll turn on the right playbooks." Options: Trades (electrician, plumber, HVAC, handyman) → `trades` · Home services (cleaning, landscaping, junk, pest) → `home-services` · Professional services (consultant, coach, designer) → `pro-services` · Salon / beauty → `salon` · Clinic front desk (dental/medical — non-clinical admin only) → `clinic-frontdesk` · Something else / skip → `general`. Restaurants/hospitality floor: say it's out of scope.
   - **Clinic only — blocking confirm:** "Confirm: Front Desk Ops is not HIPAA-compliant and has no BAA. You'll only use it for non-clinical admin (new-patient marketing, hours, reschedules) — never clinical notes, treatment plans, or insurance details. Reply YES to continue, or pick another business type." Anything but an explicit YES → do **not** set `clinic-frontdesk`; re-offer the picker or stop.
   - **Persist:** write `vertical_id: <id>` to `profile.md`; append to `ops-conventions.md` one line, e.g. `Vertical pack: trades (Proposal Desk on; estimate_request → quoted).` Then read `verticals/<id>/PACK.md` and apply its overlays for the rest of setup. Price-book step (4) uses the pack's `memories/price-book.template.md` shape; skip it entirely for `clinic-frontdesk`.
   - **Switch later:** "switch me to <type>" → confirm → rewrite `vertical_id` → reload pack. Never wipe the pipeline.
3. **Connectors, one at a time.** Ask about Gmail, wait for it to be ready, then ask about Google Calendar. Never show a checklist of all connectors. Skip any that are already ready. Drive is optional and only needed if the pipeline MCP is unavailable.
4. **Interview, short and in batches of 1 to 2 questions:**
   - Business name and what you do, in one line
   - Services/offers with typical prices
   - Service area
   - Hours and timezone
   - Reply voice: short / friendly / professional
   - Lead response target: 15 minutes / 1 hour / same day
   - Who you don't take (disqualifiers)
   - Refund/cancel/reschedule policy in their words (optional; "skip" is fine)
   - (v1.1, optional, one step) "Want quotes drafted for you? Paste your price list (item, unit, price), or say skip." Write it to `price-book.md`. Skip leaves the PLACEHOLDER rows, and proposal-desk will ask per item later. Never blocks the first win.
   Write answers to `profile.md`, `policy-refunds.md`, `ops-conventions.md`.
5. **Pipeline:** call `pipeline_init_sheet` (idempotent). If the MCP is unavailable, create a Sheet through the Drive/Sheets connector with the Contacts / Interactions / Config headers from `templates/pipeline-sheet-headers.csv` and `schemaVersion=1`. Save id + URL only (no tokens) to `pipeline-pointer.md`. Show the URL.
6. **Routines:** propose `morning-ops-brief` (weekday morning) and `follow-up-due-scan` (weekday mid-afternoon). Check for existing ones first; never create duplicates. The owner confirms each.
7. **First win by about minute 12:** search the last 7 days of Gmail for likely leads, pick the strongest one, `pipeline_upsert_contact` with stage `new` and a nextAction/dueAt from the SLA, then draft a reply in the owner's voice as an approval draft. If they want to book, offer 2 real free slots from Calendar.
7b. First-win flavor follows `PACK.md` "First win" (salon → booking draft; clinic → non-clinical inquiry/reschedule only; general → strongest lead).
8. Close with what's running and when they'll hear from you next.

## Must not
- Ask a wall of questions or list every connector at once.
- Skip the first win. If there are no leads in 7 days, say so and draft a reply to the most recent real customer email, or add a sample `example.com` contact clearly labeled as a demo.
- Send anything. Drafts only.
- Store passwords, tokens, card numbers, or customer dossiers in memories.
- Claim HIPAA, SOC 2, or any compliance; offer a BAA.
- Activate `clinic-frontdesk` without an explicit YES.
- Let the picker become a second interview: one question (+ clinic YES only if chosen).

## Done when
At least one is true: an approval draft exists for a real inbound thread, a pipeline contact exists with a nextAction, or a calendar hold/invite exists with the owner's confirmation.
