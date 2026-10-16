// Grok Bot, 2026-10-16: price-book estimate tests (EXAMPLE fixture data only).
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadCsvDir, loadBook, parseNote, estimate, findItem, parseCsv } from "../src/estimate.mjs";
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures/price-book");
const B = loadCsvDir(dir);

test("alias + plural match", () => {
  assert.equal(findItem(B.book, "high hats")[0].id, "EX-E01");
  assert.equal(findItem(B.book, "12-2")[0].id, "EX-E02");
  assert.equal(findItem(B.book, "4in LED high hats")[0].id, "EX-E01");
});
test("qty x price + labor + tax, math shown", () => {
  const e = estimate(B, parseNote("10 high hats, 200 ft 12/2"));
  assert.equal(e.complete, true);
  const hh = e.lines[0]; assert.equal(hh.unitPrice, 25.2); assert.equal(hh.materials, 252); assert.equal(hh.labor, 712.5);
  const w = e.lines[1]; assert.equal(w.unitPrice, 1.15); assert.equal(w.materials, 230); assert.equal(w.labor, 220);
  assert.equal(e.materials, 482); assert.equal(e.tax, 42.78); assert.equal(e.total, 1457.28);
  assert.ok(e.math.length === 3);
});
test("sell price override beats markup", () => {
  assert.equal(estimate(B, parseNote("2 20A circuits")).lines[0].unitPrice, 185);
});
test("unknown item is asked about, never priced", () => {
  const e = estimate(B, parseNote("10 high hats, 1 hot tub disconnect"));
  assert.equal(e.complete, false); assert.equal(e.lines.length, 1); assert.match(e.questions[0], /hot tub disconnect.*not on your price sheet/);
});
test("missing qty, missing price, missing labor rate all asked", () => {
  const b = loadBook({ items: parseCsv("Item ID,Name,Unit,Supplier Cost,Labor Hours per Unit,Labor Rate Name\nX1,widget,each,,0,\nX2,gizmo,each,5,1,Wizard\n"), labor: [], settings: [] });
  const e = estimate(b, parseNote("3 widget, 2 gizmo, some cable"));
  assert.equal(e.lines.length, 0); assert.equal(e.questions.length, 3);
});
test("EXAMPLE-tagged rows are ignored", () => {
  const b = loadBook({ items: [{ "EXAMPLE?": "EXAMPLE", Name: "fake", "Supplier Cost": "1" }] });
  assert.equal(b.book.length, 0);
});
test("minimum charge applies", () => {
  assert.equal(estimate(B, parseNote("1 switch")).total, 250);
});
test("masonry rows work too", () => {
  const e = estimate(B, parseNote("120 sq ft stone veneer, 6 bags mortar"));
  assert.equal(e.complete, true); assert.equal(e.lines[0].materials, 1482); assert.equal(e.lines[1].materials, 60);
});

// Grok Bot, 2026-10-16: tweaks (qty-1 one-offs, Taxable) + adapter tests.
import { csvSource, xlsxSource, sheetSource, jobberSource, serviceTitanSource, loadFrom } from "../src/price-sources/index.mjs";
const XLSX = path.join(dir, "../../../templates/price-book.xlsx");
test("one-off 'each' item with no qty defaults to 1; measured unit still asks", () => {
  const e = estimate(B, parseNote("permit, 12/2"));
  assert.equal(e.lines[0].qty, 1); assert.equal(e.lines[0].qtyAssumed, true); assert.match(e.math[0], /qty 1 assumed/);
  assert.match(e.questions[0], /12\/2.*how many/);
});
test("permit is not taxed", () => {
  const e = estimate(B, parseNote("10 high hats, permit"));
  assert.equal(e.tax, 22.37); assert.equal(e.lines[1].taxable, false);
});
test("xlsx template reads; blank Items tab => empty book; Example tab ignored", async () => {
  const b = await loadFrom(xlsxSource(XLSX));
  assert.equal(b.book.length, 0); assert.equal(b.settings.currency, "USD");
});
test("csv and fake-sheet sources agree", async () => {
  const a = await loadFrom(csvSource(dir));
  const csvRows = await csvSource(dir).read();
  const toGrid = (rows) => rows.length ? [Object.keys(rows[0]), ...rows.map(Object.values)] : [[]];
  const client = { getValues: async (_, t) => toGrid({ Items: csvRows.items, "Labor Rates": csvRows.labor, Settings: csvRows.settings }[t]) };
  const s = await loadFrom(sheetSource(client, "x"));
  assert.deepEqual(s, a);
});
test("ServiceTitan/Jobber stubs fail clearly", async () => {
  await assert.rejects(jobberSource().read(), /not built yet.*CSV/);
  await assert.rejects(serviceTitanSource().read(), /not built yet/);
});
