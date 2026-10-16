// Grok Bot, 2026-10-15: contract + golden tests over real stdio JSON-RPC (node:test, no deps).
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const EXPECTED = ["pipeline_init_sheet","pipeline_list_contacts","pipeline_search","pipeline_get_contact","pipeline_upsert_contact","pipeline_set_stage","pipeline_add_note","pipeline_log_interaction","pipeline_list_due_actions","pipeline_set_next_action"];

function client(env = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "pipe-"));
  const p = spawn(process.execPath, [path.join(here, "../src/server.mjs")], { env: { ...process.env, PIPELINE_BACKEND: "file", PIPELINE_DATA_FILE: path.join(dir, "p.json"), ...env } });
  let buf = ""; const waiters = new Map(); let n = 0;
  p.stdout.on("data", (d) => { buf += d; let i; while ((i = buf.indexOf("\n")) >= 0) { const m = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1); waiters.get(m.id)?.(m); } });
  const rpc = (method, params) => new Promise((r) => { const id = ++n; waiters.set(id, r); p.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n"); });
  const call = async (name, args) => { const m = await rpc("tools/call", { name, arguments: args }); return m.result; };
  return { rpc, call, close: () => p.kill() };
}

test("tools/list exposes exactly the 10 contract tools", async () => {
  const c = client(); await c.rpc("initialize", {});
  const m = await c.rpc("tools/list", {});
  assert.deepEqual(m.result.tools.map((t) => t.name).sort(), [...EXPECTED].sort());
  c.close();
});

// Grok Bot, 2026-10-15: same golden file runs against file and fake-Sheets backends; outputs must be identical.
const SHEETS_FAKE = { PIPELINE_BACKEND: "sheets", PIPELINE_SHEETS_CLIENT: "fake" };
for (const [label, env] of [["file", {}], ["sheets(fake)", SHEETS_FAKE]]) test(`golden [${label}]: upsert -> set_stage -> list_due_actions`, async () => {
  const g = JSON.parse(readFileSync(path.join(here, "../goldens/upsert-stage-due.json"), "utf8"));
  const c = client(env); const vars = {};
  const sub = (v) => JSON.parse(JSON.stringify(v).replace(/"\$(\w+)"/g, (_, k) => JSON.stringify(vars[k])));
  for (const s of g.steps) {
    const r = await c.call(s.tool, sub(s.args));
    if (s.expectError) { assert.equal(r.isError, true, s.tool); assert.match(r.content[0].text, new RegExp(s.expectError)); continue; }
    assert.ok(!r.isError, `${s.tool}: ${r.content[0].text}`);
    const out = JSON.parse(r.content[0].text);
    if (s.expect) for (const [k, v] of Object.entries(s.expect)) assert.deepEqual(out[k], v, `${s.tool}.${k}`);
    if (s.expectList) assert.deepEqual(out, sub(s.expectList));
    if (s.expectSameId) assert.equal(out.contactId, vars.contactId);
    if (s.save) vars[s.save] = out[s.save];
  }
  c.close();
});

test("schema guards: unknown field rejected, notes+interactions, search by phone", async () => {
  const c = client(); await c.call("pipeline_init_sheet", {});
  assert.equal((await c.call("pipeline_upsert_contact", { name: "X", cardNumber: "4111" })).isError, true);
  const a = JSON.parse((await c.call("pipeline_upsert_contact", { name: "Lee Sample", phone: "(555) 010-2000" })).content[0].text);
  assert.ok(!(await c.call("pipeline_add_note", { contactId: a.contactId, note: "prefers mornings" })).isError);
  assert.ok(!(await c.call("pipeline_log_interaction", { contactId: a.contactId, channel: "email", summary: "sent quote draft", direction: "outbound" })).isError);
  assert.equal((await c.call("pipeline_log_interaction", { contactId: a.contactId, channel: "email", summary: "x", direction: "sideways" })).isError, true);
  const found = JSON.parse((await c.call("pipeline_search", { query: "5550102000" })).content[0].text);
  assert.equal(found[0].contactId, a.contactId);
  const got = JSON.parse((await c.call("pipeline_get_contact", { contactId: a.contactId })).content[0].text);
  assert.match(got.notes, /prefers mornings/);
  const listed = JSON.parse((await c.call("pipeline_list_contacts", { stage: "new" })).content[0].text);
  assert.equal(listed.length, 1);
  c.close();
});

test("uninitialized pipeline soft-fails with clear message", async () => {
  const c = client(); const r = await c.call("pipeline_list_contacts", {});
  assert.equal(r.isError, true); assert.match(r.content[0].text, /pipeline_init_sheet/); c.close();
});

// Grok Bot, 2026-10-15: without the fake client, the real adapter must refuse loudly (no fake creds, no network).
test("real sheets adapter refuses until OAuth is approved", async () => {
  const c = client({ PIPELINE_BACKEND: "sheets", PIPELINE_SHEETS_CLIENT: "", GOOGLE_OAUTH_REFRESH_TOKEN: "" }); const r = await c.call("pipeline_init_sheet", {});
  assert.equal(r.isError, true); assert.match(r.content[0].text, /needs OAuth client — blocked on board yes/); c.close();
});
