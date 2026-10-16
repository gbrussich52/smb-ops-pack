<!-- Grok Bot, 2026-10-15: clinic-frontdesk overlay for inbox-triage; additive must/must-not. -->

# overlay: clinic-frontdesk / inbox-triage
Apply on top of core `inbox-triage`. ops-safety wins on conflict.

- Labels allowed: `new_patient_inquiry` (marketing), `scheduling`, `hours_location`, `other`. No clinical labels.
- Thread with clinical content → label `clinical_escalate`, summary says only "contains clinical details — not summarized", draft = "Thanks for reaching out — please use our patient portal or call the office at <phone> so our team can help." Escalate to owner.
- Do not open/describe attachments that look clinical (X-rays, lab results, insurance cards).
