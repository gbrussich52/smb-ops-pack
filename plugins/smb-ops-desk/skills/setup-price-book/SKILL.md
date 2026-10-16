---
name: setup-price-book
description: Build the owner's own price sheet (items, costs, markup, labor, taxable) in THEIR Google Drive or as an Excel file, help them fill it, and save its ID so proposals price from it.
---
<!-- Grok Bot, 2026-10-16: self-serve price book. Everything lives in the owner's own account; nothing is shared from anyone else's. -->
# Setup Price Book

## When to use
First run of Proposal Desk, the owner says "set up my prices", or `price-book.md` has no `sheet_id`/`file`.

## Steps (plain English, one question at a time)
1. Ask: "Do you want your price sheet in your Google Drive, or as an Excel file you keep?"
2. **Google:** if their Google Drive isn't connected, ask them to connect THEIR account. Upload the bundled `templates/price-book.xlsx` (bundled in this plugin) to their Drive, converted to a Google Sheet, named "<Business> Price Book". Leave it private (no sharing). **Excel:** hand them the bundled `price-book.xlsx` to download, and ask them to send it back to you after filling it in (or whenever prices change).
3. Fill it together. Offer three ways:
   - "Paste or forward a supplier invoice, quote or price list." Read it, then propose rows: Name, Unit, Supplier Cost from the document. Ask once for markup % (or a sell price) and labor hours per unit. Show the rows and get a yes before writing them.
   - "Tell me your items out loud": "high hats, I pay 18, charge 40% over, 45 minutes each."
   - The owner types them into the sheet himself.
   Also ask for the labor rates (name + hourly rate), sales tax % on materials, default markup, and minimum job charge. Mark permits and fees with Taxable = N.
4. Ask for the other names he uses for each item ("can light", "pot light") and put them in Aliases.
5. Save to the `price-book.md` memory: `source: sheet|xlsx|csv`, `sheet_id:` or `file:`, and the date.
6. Test it: run a three-item sample estimate (`estimate.mjs`) and show the math. Fix rows if he says a number is wrong.

## Must
- Every price comes from the owner or his documents. Never fill a cost, markup, or labor time yourself. If a value is missing, leave it blank and ask.
- Ignore EXAMPLE rows. Never copy them in as his prices.
- Show rows before writing them. He approves every write to his sheet.

## Must not
- Share the sheet with anyone, put it in anyone else's Drive, or ask for someone else's account.
- Post prices anywhere public.

## Done when
`price-book.md` has a source + ID, at least one labor rate exists, and the sample estimate gets his OK.
