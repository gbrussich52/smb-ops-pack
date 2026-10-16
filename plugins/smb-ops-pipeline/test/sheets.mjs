// Grok Bot, 2026-10-15: in-process tests of SheetsBackend over FakeSheetsClient, inspecting the raw tab cells.
import test from "node:test";
import assert from "node:assert/strict";
import { SheetsBackend, FakeSheetsClient, GoogleSheetsClient, TABS } from "../src/sheets.mjs";
import { CONTACT_COLUMNS, CONFIG_COLUMNS } from "../src/schema.mjs";

const mk = () => { const client = new FakeSheetsClient(); return { client, b: new SheetsBackend({ client }) }; };

test("init creates 3 schemaVersion=1 tabs and is idempotent", async () => {
  const { client, b } = mk();
  const r1 = await b.initSheet({ title: "T" });
  assert.equal(r1.created, true);
  const book = client.books.get(r1.spreadsheetId);
  assert.deepEqual([...book.tabs.keys()].sort(), Object.keys(TABS).sort());
  assert.deepEqual(book.tabs.get("Contacts")[0], CONTACT_COLUMNS);
  const cfg = await client.getValues(r1.spreadsheetId, "Config");
  assert.deepEqual(cfg[0], CONFIG_COLUMNS);
  assert.deepEqual(cfg.find((r) => r[0] === "schemaVersion"), ["schemaVersion", "1"]);
  const r2 = await b.initSheet({});
  assert.equal(r2.created, false); assert.equal(r2.spreadsheetId, r1.spreadsheetId);
  assert.equal(client.books.size, 1);
});

test("upsert -> email match -> set_stage -> list_due_actions over fake Sheets", async () => {
  const { client, b } = mk(); const { spreadsheetId } = await b.initSheet({});
  const a = await b.upsertContact({ name: "Pat Example", email: "pat@example.com", nextAction: "Call back", dueAt: "2026-10-14T15:00:00Z" });
  const again = await b.upsertContact({ email: " PAT@Example.com ", company: "Pat's Place" });
  assert.equal(again.contactId, a.contactId); assert.equal(again.name, "Pat Example");
  assert.equal((await client.getValues(spreadsheetId, "Contacts")).length, 2, "header + 1 row");
  assert.equal((await b.setStage({ contactId: a.contactId, stage: "quoted" })).stage, "quoted");
  await assert.rejects(b.setStage({ contactId: a.contactId, stage: "maybe" }), /stage must be one of/);
  assert.deepEqual(await b.listDueActions({ before: "2026-10-15T00:00:00Z" }), [{ contactId: a.contactId, nextAction: "Call back", dueAt: "2026-10-14T15:00:00Z" }]);
  await b.setStage({ contactId: a.contactId, stage: "done" });
  assert.deepEqual(await b.listDueActions({ before: "2026-10-15T00:00:00Z" }), []);
  // persisted in cells, reloaded by a fresh backend pointing at the same sheet
  const b2 = new SheetsBackend({ client, spreadsheetId });
  assert.equal((await b2.getContact({ contactId: a.contactId })).company, "Pat's Place");
});

test("hand-reordered columns still parse; missing column is a clear error", async () => {
  const { client, b } = mk(); const { spreadsheetId } = await b.initSheet({});
  const a = await b.upsertContact({ name: "Lee", email: "lee@example.com" });
  const [h, r] = await client.getValues(spreadsheetId, "Contacts");
  await client.replaceValues(spreadsheetId, "Contacts", [[...h].reverse(), [...r].reverse()]);
  assert.equal((await b.getContact({ contactId: a.contactId })).email, "lee@example.com");
  await client.replaceValues(spreadsheetId, "Contacts", [h.filter((c) => c !== "stage")]);
  await assert.rejects(b.listContacts({}), /missing columns: stage/);
});

test("unsupported schemaVersion refused", async () => {
  const { client, b } = mk(); const { spreadsheetId } = await b.initSheet({});
  await client.replaceValues(spreadsheetId, "Config", [["key", "value"], ["schemaVersion", "2"]]);
  await assert.rejects(b.listContacts({}), /Unsupported schemaVersion 2/);
});

test("real GoogleSheetsClient throws blocked-on-yes and invents no creds", async () => {
  const c = new GoogleSheetsClient({});
  await assert.rejects(c.createSpreadsheet({}), /needs OAuth client — blocked on board yes/);
  await assert.rejects(new SheetsBackend({ client: c, spreadsheetId: "x" }).listContacts({}), /blocked on board yes/);
});
