# smb-ops-pack: Front Desk Ops

A front desk for solo and micro local service businesses (trades, home services, cleaning, landscaping, mobile beauty, booked-appointment consultants). It triages Gmail, drafts lead replies for your approval, books on Google Calendar, tracks a simple pipeline, and drafts review asks and replies.

> **Status:** v0.1.0. Publisher: Giani Ventures LLC. License: MIT.

## Plugins
| Plugin | What it is |
| --- | --- |
| `plugins/smb-ops-desk` | 9 skills (incl. proposal-desk + setup-price-book), 2 always-on rules, `front-desk-ops` agent. Markdown only. |
| `plugins/smb-ops-pipeline` | stdio MCP, exactly 10 `pipeline_*` tools, no npm dependencies |

## Install journey (first win in 15 minutes or less)
1. Install `smb-ops-desk` (and optionally `smb-ops-pipeline`).
2. Run **getting-started**. It connects **Gmail**, then **Google Calendar**, one at a time.
3. Answer a short interview (offers, prices, area, hours, voice, response target).
4. The pipeline is created (`pipeline_init_sheet`, or the Drive/Sheets fallback).
5. Confirm two routines: morning ops brief and afternoon follow-up scan.
6. **First win:** your best lead from the last 7 days is added to the pipeline and a reply is drafted in your voice for you to approve.

## Data flows
- Mail and calendar stay in **your** Google account and are reached through the connectors you authorize.
- In v0.1 the pipeline lives in a local JSON file (file backend) or your own Google Sheet (connector fallback). Nothing is hosted by us.
- Memories hold business facts (offers, hours, voice), not customer dossiers.
- Nothing is sent without your approval. There is no cold outreach.

## Non-goals (v1)
Not a CRM replacement, phone/SMS receptionist, bookkeeping/payroll/POS, cold outreach engine, or restaurant ops. No browser automation of Gmail or Calendar. **Not for HIPAA covered entities or clinical PHI**, and it makes no compliance claims.

## Secrets
No secrets are in this repo. `GOOGLE_OAUTH_REFRESH_TOKEN` is a declared plugin variable that you set in Configure/env. `.gitignore` blocks credential files.

## Develop
```
node scripts/validate-template.mjs
cd plugins/smb-ops-pipeline && npm test
```
Schema: `templates/pipeline-sheet-headers.csv`. Goldens: `goldens/` and `plugins/smb-ops-pipeline/goldens/`.

License: MIT.

## Price book estimates
`setup-price-book` creates a price sheet from the bundled `templates/price-book.xlsx` in the owner's own Google Drive, or hands it over as an Excel file. Proposal Desk then turns a dictated walk-through ("10 high hats, 200 ft 12/2, permit") into line items: quantity x price, labor, tax on taxable lines only. It shows the math and asks about anything not on the sheet. It never invents prices. The rows on the Example tab are labeled EXAMPLE and ignored.

## Install locally / test
1. Clone the repo, then copy or symlink `plugins/smb-ops-desk` and `plugins/smb-ops-pipeline` into `~/.cursor/plugins/local/`.
2. `cd plugins/smb-ops-pipeline && npm test` (Node 18+, no dependencies).
3. `node scripts/validate-template.mjs` from the repo root validates the manifests.

## License
MIT. See `LICENSE`.
