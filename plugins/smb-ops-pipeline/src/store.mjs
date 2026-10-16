import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import { SCHEMA_VERSION, STAGES, WRITABLE_CONTACT_FIELDS, DIRECTIONS } from "./schema.mjs";

export class ToolError extends Error {}

// Grok Bot, 2026-10-15: file backend so goldens run green without Google OAuth (locked fallback path).
// Same 10 operations as the Sheets adapter; data shape mirrors the three Sheet tabs exactly.
export class FileBackend {
  constructor(file) {
    this.file = file || process.env.PIPELINE_DATA_FILE || path.join(os.homedir(), ".smb-ops-pipeline", "pipeline.json");
    this.now = () => new Date().toISOString();
  }
  async load() {
    try { return JSON.parse(await fs.readFile(this.file, "utf8")); }
    catch (e) { if (e.code === "ENOENT") return null; throw e; }
  }
  async save(db) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    const tmp = this.file + ".tmp";
    await fs.writeFile(tmp, JSON.stringify(db, null, 2));
    await fs.rename(tmp, this.file);
  }
  async db() {
    const db = await this.load();
    if (!db) throw new ToolError("Pipeline not initialized. Call pipeline_init_sheet first.");
    // Grok Bot, 2026-10-15: refuse unknown schema versions instead of silently drifting (ADVERSARIAL §4).
    if (db.config.schemaVersion !== SCHEMA_VERSION) throw new ToolError(`Unsupported schemaVersion ${db.config.schemaVersion}; this server supports ${SCHEMA_VERSION}.`);
    return db;
  }
  async initSheet({ title } = {}) {
    const existing = await this.load();
    if (existing) return { spreadsheetId: existing.config.spreadsheetId, url: existing.config.url, created: false };
    const id = "local-" + randomUUID();
    const db = { title: title || "Front Desk Pipeline", contacts: [], interactions: [],
      config: { schemaVersion: SCHEMA_VERSION, ownerEmail: "", timezone: "", spreadsheetId: id, url: "file://" + this.file } };
    await this.save(db);
    return { spreadsheetId: id, url: db.config.url, created: true };
  }
  find(db, contactId) {
    const c = db.contacts.find((x) => x.contactId === contactId);
    if (!c) throw new ToolError(`No contact with contactId ${contactId}`);
    return c;
  }
  async listContacts({ stage, limit = 50 } = {}) {
    if (stage !== undefined) checkStage(stage);
    const db = await this.db();
    return db.contacts.filter((c) => !stage || c.stage === stage).slice(0, clampLimit(limit));
  }
  async search({ query }) {
    if (!query || typeof query !== "string") throw new ToolError("query is required");
    const q = query.toLowerCase(); const qd = q.replace(/\D/g, "");
    const db = await this.db();
    return db.contacts.filter((c) => ["name","email","company"].some((k) => (c[k] || "").toLowerCase().includes(q)) ||
      (qd.length >= 4 && (c.phone || "").replace(/\D/g, "").includes(qd)));
  }
  async getContact({ contactId }) { return this.find(await this.db(), contactId); }
  async upsertContact(args = {}) {
    const db = await this.db();
    for (const k of Object.keys(args)) if (k !== "contactId" && !WRITABLE_CONTACT_FIELDS.includes(k)) throw new ToolError(`Unknown contact field "${k}" (v1 schema is fixed)`);
    if (args.stage !== undefined) checkStage(args.stage);
    if (args.dueAt) checkDate(args.dueAt, "dueAt");
    const email = norm(args.email); const phone = digits(args.phone);
    // Grok Bot, 2026-10-15: match order per SPEC: contactId, then email, then phone, else create.
    let c = (args.contactId && db.contacts.find((x) => x.contactId === args.contactId))
      || (email && db.contacts.find((x) => norm(x.email) === email))
      || (!email && phone && db.contacts.find((x) => digits(x.phone) === phone));
    const t = this.now();
    if (!c) {
      if (!args.name && !email && !phone) throw new ToolError("Need at least name, email, or phone to create a contact");
      c = { contactId: "c_" + randomUUID().slice(0, 8), name: "", email: "", phone: "", company: "", stage: "new", source: "", offer: "", valueEstimate: "", nextAction: "", dueAt: "", notes: "", createdAt: t, updatedAt: t };
      db.contacts.push(c);
    }
    for (const k of WRITABLE_CONTACT_FIELDS) if (args[k] !== undefined && k !== "notes") c[k] = String(args[k]);
    if (args.notes) c.notes = c.notes ? c.notes + "\n" + args.notes : String(args.notes);
    c.updatedAt = t;
    await this.save(db); return c;
  }
  async setStage({ contactId, stage }) {
    checkStage(stage); const db = await this.db(); const c = this.find(db, contactId);
    c.stage = stage; c.updatedAt = this.now(); await this.save(db); return c;
  }
  async addNote({ contactId, note }) {
    if (!note) throw new ToolError("note is required");
    const db = await this.db(); const c = this.find(db, contactId); const t = this.now();
    c.notes = c.notes ? c.notes + "\n" + note : note; c.updatedAt = t;
    db.interactions.push({ interactionId: "i_" + randomUUID().slice(0, 8), contactId, at: t, channel: "note", direction: "internal", summary: note });
    await this.save(db); return { ok: true };
  }
  async logInteraction({ contactId, channel, summary, direction }) {
    if (!channel || !summary) throw new ToolError("channel and summary are required");
    if (!DIRECTIONS.includes(direction)) throw new ToolError(`direction must be one of ${DIRECTIONS.join(", ")}`);
    const db = await this.db(); this.find(db, contactId);
    db.interactions.push({ interactionId: "i_" + randomUUID().slice(0, 8), contactId, at: this.now(), channel, direction, summary });
    await this.save(db); return { ok: true };
  }
  async listDueActions({ before } = {}) {
    const cutoff = before ? checkDate(before, "before") : Date.now();
    const db = await this.db();
    return db.contacts.filter((c) => c.nextAction && c.dueAt && !["done", "lost"].includes(c.stage) && Date.parse(c.dueAt) <= cutoff)
      .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))
      .map((c) => ({ contactId: c.contactId, nextAction: c.nextAction, dueAt: c.dueAt }));
  }
  async setNextAction({ contactId, nextAction, dueAt }) {
    if (!nextAction) throw new ToolError("nextAction is required"); checkDate(dueAt, "dueAt");
    const db = await this.db(); const c = this.find(db, contactId);
    c.nextAction = nextAction; c.dueAt = dueAt; c.updatedAt = this.now(); await this.save(db); return c;
  }
}

// Grok Bot, 2026-10-15: sheets path lives in sheets.mjs. PIPELINE_SHEETS_CLIENT=fake selects the in-process fake
// (tests/dogfood); otherwise the real adapter, which refuses until the OAuth client is approved.
export async function makeBackend() {
  if ((process.env.PIPELINE_BACKEND || "file") !== "sheets") return new FileBackend();
  const { SheetsBackend, FakeSheetsClient, GoogleSheetsClient } = await import("./sheets.mjs");
  const client = process.env.PIPELINE_SHEETS_CLIENT === "fake" ? new FakeSheetsClient() : new GoogleSheetsClient();
  return new SheetsBackend({ client });
}

function checkStage(s) { if (!STAGES.includes(s)) throw new ToolError(`stage must be one of ${STAGES.join(", ")}`); }
function checkDate(s, n) { const t = Date.parse(s); if (Number.isNaN(t)) throw new ToolError(`${n} must be an ISO 8601 date`); return t; }
function clampLimit(l) { const n = Number(l); return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 50; }
function norm(e) { return e ? String(e).trim().toLowerCase() : ""; }
function digits(p) { return p ? String(p).replace(/\D/g, "") : ""; }
