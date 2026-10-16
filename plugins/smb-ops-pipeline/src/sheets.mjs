// Grok Bot, 2026-10-15: Sheets backend = FileBackend logic over a Sheets-shaped client, so all 10 tools share one
// implementation and goldens are identical across backends. Only load()/save()/initSheet() differ.
import { FileBackend, ToolError } from "./store.mjs";
import { SCHEMA_VERSION, CONTACT_COLUMNS, INTERACTION_COLUMNS, CONFIG_COLUMNS } from "./schema.mjs";

export const TABS = { Contacts: CONTACT_COLUMNS, Interactions: INTERACTION_COLUMNS, Config: CONFIG_COLUMNS };
const CONFIG_KEYS = ["schemaVersion", "ownerEmail", "timezone", "title"];

/**
 * Client contract (mirrors the Sheets v4 calls the real adapter will make):
 *   createSpreadsheet({ title, tabs: {name: headers[]} }) -> { spreadsheetId, url }   // spreadsheets.create
 *   getValues(spreadsheetId, tab) -> string[][] incl. header row, [] if tab missing    // values.get
 *   replaceValues(spreadsheetId, tab, rows) -> void (clear + write, header included)   // values.clear + values.update
 */

// Grok Bot, 2026-10-15: in-process fake for tests/dogfood. Stores every cell as a string, like the Sheets API
// returns with valueRenderOption=FORMATTED_VALUE, so type drift shows up here before it shows up in prod.
export class FakeSheetsClient {
  constructor() { this.books = new Map(); this.n = 0; this.calls = []; }
  async createSpreadsheet({ title, tabs }) {
    this.calls.push("create");
    const spreadsheetId = `fake-sheet-${++this.n}`;
    const book = { title, tabs: new Map() };
    for (const [name, headers] of Object.entries(tabs)) book.tabs.set(name, [headers.map(String)]);
    this.books.set(spreadsheetId, book);
    return { spreadsheetId, url: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` };
  }
  book(id) { const b = this.books.get(id); if (!b) throw new ToolError(`Spreadsheet ${id} not found`); return b; }
  async getValues(id, tab) { this.calls.push(`get:${tab}`); return (this.book(id).tabs.get(tab) || []).map((r) => [...r]); }
  async replaceValues(id, tab, rows) {
    this.calls.push(`put:${tab}`);
    this.book(id).tabs.set(tab, rows.map((r) => r.map((v) => (v == null ? "" : String(v)))));
  }
}

// Grok Bot, 2026-10-15: real adapter placeholder. Deliberately no credentials and no network calls until the publisher
// approves creating a Google Cloud OAuth client. TODO(oauth-yes):
//   1. exchange GOOGLE_OAUTH_REFRESH_TOKEN (+ client id/secret from env) at https://oauth2.googleapis.com/token
//   2. call sheets.googleapis.com/v4: spreadsheets.create, values.get, values.clear, values.update(RAW)
//   3. honor PIPELINE_SPREADSHEET_ID so init reuses an existing Sheet; backoff on 429.
export const OAUTH_BLOCKED = "Sheets API adapter needs OAuth client — blocked on board yes. Use PIPELINE_BACKEND=file or the Drive/Sheets connector fallback (README).";
export class GoogleSheetsClient {
  constructor(env = process.env) {
    this.configured = Boolean(env.GOOGLE_OAUTH_REFRESH_TOKEN && env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET);
  }
  async #blocked() {
    // Grok Bot, 2026-10-15: even if env vars are set, the HTTP calls are not written yet — fail loudly, never fake success.
    throw new ToolError(this.configured ? "Sheets API adapter: OAuth env present but HTTP calls not implemented yet (TODO oauth-yes)." : OAUTH_BLOCKED);
  }
  async createSpreadsheet() { return this.#blocked(); }
  async getValues() { return this.#blocked(); }
  async replaceValues() { return this.#blocked(); }
}

export class SheetsBackend extends FileBackend {
  constructor({ client, spreadsheetId } = {}) {
    super("sheets:");
    this.client = client || new GoogleSheetsClient();
    this.spreadsheetId = spreadsheetId || process.env.PIPELINE_SPREADSHEET_ID || "";
  }
  async load() {
    if (!this.spreadsheetId) return null;
    const [c, i, cfg] = await Promise.all(Object.keys(TABS).map((t) => this.client.getValues(this.spreadsheetId, t)));
    if (!cfg.length) return null;
    const kv = Object.fromEntries(rows(cfg, CONFIG_COLUMNS).map((r) => [r.key, r.value]));
    if (kv.schemaVersion === undefined) return null;
    return { title: kv.title || "", contacts: rows(c, CONTACT_COLUMNS), interactions: rows(i, INTERACTION_COLUMNS),
      config: { schemaVersion: kv.schemaVersion, ownerEmail: kv.ownerEmail || "", timezone: kv.timezone || "",
        spreadsheetId: this.spreadsheetId, url: kv.url || "" } };
  }
  async save(db) {
    // Grok Bot, 2026-10-15: whole-tab rewrite keeps v1 simple and exact; fine for solo-owner sizes (<few k rows).
    const id = this.spreadsheetId;
    await this.client.replaceValues(id, "Contacts", table(db.contacts, CONTACT_COLUMNS));
    await this.client.replaceValues(id, "Interactions", table(db.interactions, INTERACTION_COLUMNS));
    const cfg = { schemaVersion: db.config.schemaVersion, ownerEmail: db.config.ownerEmail, timezone: db.config.timezone, title: db.title, url: db.config.url };
    await this.client.replaceValues(id, "Config", [CONFIG_COLUMNS, ...[...CONFIG_KEYS, "url"].map((k) => [k, cfg[k] ?? ""])]);
  }
  async initSheet({ title } = {}) {
    const existing = await this.load();
    if (existing) return { spreadsheetId: this.spreadsheetId, url: existing.config.url, created: false };
    const t = title || "Front Desk Pipeline";
    const { spreadsheetId, url } = await this.client.createSpreadsheet({ title: t, tabs: TABS });
    this.spreadsheetId = spreadsheetId;
    await this.save({ title: t, contacts: [], interactions: [], config: { schemaVersion: SCHEMA_VERSION, ownerEmail: "", timezone: "", spreadsheetId, url } });
    return { spreadsheetId, url, created: true };
  }
}

// Grok Bot, 2026-10-15: header-driven parse so column order in a hand-edited Sheet doesn't corrupt data.
function rows(values, cols) {
  if (!values.length) return [];
  const [hdr, ...body] = values;
  const missing = cols.filter((c) => !hdr.includes(c));
  if (missing.length) throw new ToolError(`Sheet tab is missing columns: ${missing.join(", ")} (schemaVersion 1)`);
  return body.filter((r) => r.some((v) => v !== "")).map((r) => Object.fromEntries(cols.map((c) => [c, r[hdr.indexOf(c)] ?? ""])));
}
function table(objs, cols) { return [cols, ...objs.map((o) => cols.map((c) => o[c] ?? ""))]; }
