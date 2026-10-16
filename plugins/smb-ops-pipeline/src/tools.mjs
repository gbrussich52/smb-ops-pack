import { STAGES, DIRECTIONS } from "./schema.mjs";
const S = { type: "string" };
const stage = { type: "string", enum: STAGES };
const id = { contactId: S };
// Grok Bot, 2026-10-15: exactly the 10 tools in SPEC §3.2. Adding an 11th breaks the contract test on purpose.
export const TOOLS = [
  { name: "pipeline_init_sheet", description: "Create the pipeline (Contacts, Interactions, Config tabs, schemaVersion=1). Idempotent.", inputSchema: { type: "object", properties: { title: S } }, run: (b, a) => b.initSheet(a) },
  { name: "pipeline_list_contacts", description: "List contacts, optionally filtered by stage. Default limit 50.", inputSchema: { type: "object", properties: { stage, limit: { type: "number" } } }, run: (b, a) => b.listContacts(a) },
  { name: "pipeline_search", description: "Search contacts by name, email, phone, or company.", inputSchema: { type: "object", properties: { query: S }, required: ["query"] }, run: (b, a) => b.search(a) },
  { name: "pipeline_get_contact", description: "Get one contact by contactId.", inputSchema: { type: "object", properties: id, required: ["contactId"] }, run: (b, a) => b.getContact(a) },
  { name: "pipeline_upsert_contact", description: "Create or update a contact. Matches on email, else phone, else creates. notes are appended.", inputSchema: { type: "object", properties: { contactId: S, name: S, email: S, phone: S, company: S, stage, source: S, offer: S, valueEstimate: S, nextAction: S, dueAt: S, notes: S }, additionalProperties: false }, run: (b, a) => b.upsertContact(a) },
  { name: "pipeline_set_stage", description: `Set stage (${STAGES.join(" | ")}).`, inputSchema: { type: "object", properties: { ...id, stage }, required: ["contactId", "stage"] }, run: (b, a) => b.setStage(a) },
  { name: "pipeline_add_note", description: "Append a note to the contact and log it in Interactions.", inputSchema: { type: "object", properties: { ...id, note: S }, required: ["contactId", "note"] }, run: (b, a) => b.addNote(a) },
  { name: "pipeline_log_interaction", description: "Log an email/call/meeting interaction.", inputSchema: { type: "object", properties: { ...id, channel: S, summary: S, direction: { type: "string", enum: DIRECTIONS } }, required: ["contactId", "channel", "summary", "direction"] }, run: (b, a) => b.logInteraction(a) },
  { name: "pipeline_list_due_actions", description: "List open contacts whose nextAction is due on or before `before` (default now), oldest first.", inputSchema: { type: "object", properties: { before: S } }, run: (b, a) => b.listDueActions(a) },
  { name: "pipeline_set_next_action", description: "Set nextAction and dueAt (ISO 8601) for a contact.", inputSchema: { type: "object", properties: { ...id, nextAction: S, dueAt: S }, required: ["contactId", "nextAction", "dueAt"] }, run: (b, a) => b.setNextAction(a) },
];
