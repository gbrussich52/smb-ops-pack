---
name: pipeline-keeper
description: Keep the one-sheet pipeline accurate using only the 10 smb-ops-pipeline tools. Use for any contact, stage, note, or next-action update and for "who do I owe a call?" questions.
---

<!-- Grok Bot, 2026-10-15: thin-MCP contract; schema is fixed for v1 so the Sheet never drifts. -->

# Pipeline keeper
<!-- Grok Bot, 2026-10-15: v1.1 Proposal Desk patch (estimate_request handoff / ask-vs-act / Doc URL on quoted). -->

## When to use
- Any time another skill learns something about a contact.
- "Who's in quoted?", "what's due today?", "mark Pat booked", "add a note."

## Tools (the only ones)
`pipeline_init_sheet`, `pipeline_list_contacts`, `pipeline_search`, `pipeline_get_contact`, `pipeline_upsert_contact`, `pipeline_set_stage`, `pipeline_add_note`, `pipeline_log_interaction`, `pipeline_list_due_actions`, `pipeline_set_next_action`.

## Stages
`new` (just came in) → `qualified` (fits; real need) → `quoted` (price sent) → `booked` (on calendar) → `done` (job finished; triggers review-desk) → `nurture` (not now) | `lost` (no / disqualified).

## Must
1. `pipeline_search` before creating, so you don't add duplicates. Upsert matches on email, then phone.
2. Every open contact gets a `nextAction` + `dueAt`. A contact with no next step is a dropped lead.
3. Log meaningful touches with `pipeline_log_interaction` (inbound/outbound/internal).
4. On `done`, hand off to review-desk.
4a. **`quoted` means a proposal exists.** Set `quoted` only when proposal-desk has a Doc. Log `pipeline_log_interaction` with `proposalId | version | status | total | validUntil | docUrl`, set `valueEstimate` to the owner-confirmed total, and nextAction "Follow up on open quote <proposalId>" due validUntil − 2 days. On a revision, note the old version `superseded`. Don't move to `booked` without an accepted quote (or owner say-so) plus a calendar slot. No new columns or tabs: proposal data lives in notes/Interactions (no proposal MCP tools in v1.1).
5. If the MCP is down or not initialized, say so in one line and keep working. With the Drive/Sheets connector fallback, write rows with the same columns:
   `contactId | name | email | phone | company | stage | source | offer | valueEstimate | nextAction | dueAt | notes | createdAt | updatedAt`

## Must not
- Invent columns or stages, or write free-form tabs.
- Store card numbers, bank details, SSNs, passwords, or health information in notes.
- Delete contacts or clear the sheet. Use `lost` and ask the owner about any removal.
