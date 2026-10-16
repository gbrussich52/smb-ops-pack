# smb-ops-pipeline

A thin stdio MCP server with **exactly 10 tools** over one pipeline (tabs: Contacts, Interactions, Config, `schemaVersion=1`).

| Tool | Purpose |
| --- | --- |
| pipeline_init_sheet | create the pipeline (idempotent) |
| pipeline_list_contacts | list, optional stage filter, default 50 |
| pipeline_search | by name/email/phone/company |
| pipeline_get_contact | one contact |
| pipeline_upsert_contact | match email → phone → create |
| pipeline_set_stage | new, qualified, quoted, booked, done, nurture, lost |
| pipeline_add_note | append note + Interactions row |
| pipeline_log_interaction | channel, direction (inbound/outbound/internal), summary |
| pipeline_list_due_actions | open items due before a date |
| pipeline_set_next_action | nextAction + dueAt |

## Backends
- `PIPELINE_BACKEND=file` (default): local JSON at `~/.smb-ops-pipeline/pipeline.json` (override with `PIPELINE_DATA_FILE`). Same schema as the Sheet. Works today with no auth.
- `PIPELINE_BACKEND=sheets` + `PIPELINE_SHEETS_CLIENT=fake`: the Sheets backend (`src/sheets.mjs`) running against an **in-process fake Google Sheets client**. It uses the same three tabs (Contacts, Interactions, Config with `schemaVersion=1`), keeps every cell as a string, parses by header name, and passes the same golden as the file backend. Data lives in memory only, so it's for tests and dogfood, not storage.
- `PIPELINE_BACKEND=sheets` (real client): **not live**. `GoogleSheetsClient` throws `needs OAuth client — blocked on board yes`. It's still a TODO: refresh `GOOGLE_OAUTH_REFRESH_TOKEN` (plus client id and secret), use `PIPELINE_SPREADSHEET_ID`, and call Sheets v4 create / values.get / clear / update. There are no credentials in the repo. <!-- Grok Bot, 2026-10-15: honest status after fake-Sheets work -->

## Drive/Sheets connector fallback (allowed v1 ship path)
If you want the data in a real Google Sheet before the adapter exists, the `pipeline-keeper` skill runs the same 10 operations by hand through the Google Drive/Sheets connector:
1. Create a Sheet with tabs and headers from `templates/` (Config: `schemaVersion=1`).
2. Save the Sheet id in `PIPELINE_SPREADSHEET_ID` / `pipeline-pointer.md`.
3. Follow the same match rules (email → phone), stage enum, and columns. Don't add columns.

## Secrets
`GOOGLE_OAUTH_REFRESH_TOKEN` is a declared variable only. Set it in Configure/env, never in git.

## Test
`npm test` (node ≥18, no dependencies): 11 tests. They check the 10-tool contract, run the golden against both file and fake-Sheets, cover schema guards and uninitialized soft-fail, and confirm the real adapter refuses. `test/sheets.mjs` adds idempotent init, email match, invalid-stage rejection, reordered or missing columns, and the schemaVersion guard.
