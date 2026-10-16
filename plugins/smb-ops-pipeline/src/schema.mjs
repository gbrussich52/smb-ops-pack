// Grok Bot, 2026-10-15: single source of truth for the locked v1 Sheet schema (SPEC §3.2). Do not add columns.
export const SCHEMA_VERSION = "1";
export const STAGES = ["new", "qualified", "quoted", "booked", "done", "nurture", "lost"];
export const CONTACT_COLUMNS = ["contactId","name","email","phone","company","stage","source","offer","valueEstimate","nextAction","dueAt","notes","createdAt","updatedAt"];
export const INTERACTION_COLUMNS = ["interactionId","contactId","at","channel","direction","summary"];
export const CONFIG_COLUMNS = ["key","value"];
export const DIRECTIONS = ["inbound", "outbound", "internal"];
// Grok Bot, 2026-10-15: fields a caller may set via upsert; ids/timestamps are server-owned.
export const WRITABLE_CONTACT_FIELDS = ["name","email","phone","company","stage","source","offer","valueEstimate","nextAction","dueAt","notes"];
