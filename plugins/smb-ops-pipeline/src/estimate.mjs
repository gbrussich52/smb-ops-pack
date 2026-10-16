// Grok Bot, 2026-10-16: price-book lookup + estimate math. Library + CLI, deliberately NOT an 11th MCP tool (10-tool contract stays).
// Reads the price-book sheet tabs (Items, Labor Rates, Settings) as CSV/rows. Never invents a price: unknown or unpriced items go to `questions`.
import { readFileSync } from "node:fs";

export function parseCsv(text) {
  const rows = []; let row = [], cell = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') q = false; else cell += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); rows.push(row); row = []; cell = ""; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [h, ...rest] = rows.filter((r) => r.some((x) => x.trim()));
  return rest.map((r) => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? "").trim()])));
}

const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? null : Number(v));
const norm = (s) => String(s).toLowerCase().replace(/["']/g, "").replace(/[-_]/g, "/").replace(/\s+/g, " ").trim();
const singular = (s) => s.replace(/(es|s)$/, "");
const r2 = (n) => Math.round(n * 100) / 100;

export function loadBook({ items, labor = [], settings = [] }) {
  const rates = Object.fromEntries(labor.filter((r) => r["Rate Name"]).map((r) => [norm(r["Rate Name"]), num(r["Hourly Rate"])]));
  const set = Object.fromEntries(settings.map((r) => [r.Setting, r.Value]));
  const book = items.filter((r) => r.Name && r["EXAMPLE?"] !== "EXAMPLE").map((r) => ({
    id: r["Item ID"], name: r.Name, unit: r.Unit || "each",
    keys: [r.Name, ...(r["Aliases (separate with ;)"] || "").split(";")].map(norm).filter(Boolean),
    cost: num(r["Supplier Cost"]), markup: num(r["Markup %"]), sell: num(r["Sell Price (optional override)"]),
    hours: num(r["Labor Hours per Unit"]) ?? 0, rate: r["Labor Rate Name"] || "",
    // Grok Bot, 2026-10-16: Taxable column; blank = taxable, N = untaxed (permits, fees).
    taxable: !/^(n|no|false|0)$/i.test(r["Taxable (Y/N)"] || r.Taxable || ""),
  }));
  return { book, rates, settings: { tax: num(set.materials_tax_pct) ?? 0, markup: num(set.default_markup_pct), min: num(set.minimum_charge), currency: set.currency || "USD" } };
}

export function findItem(book, phrase) {
  const p = norm(phrase), ps = singular(p);
  const exact = book.filter((it) => it.keys.some((k) => k === p || singular(k) === ps));
  if (exact.length) return exact;
  // whole-word containment, e.g. "4in high hats" -> "high hat"; longest key wins, ties = ambiguous
  const hits = book.map((it) => ({ it, len: Math.max(0, ...it.keys.filter((k) => new RegExp(`(^|\\W)${k.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")}(es|s)?(\\W|$)`).test(p)).map((k) => k.length)) })).filter((h) => h.len > 0);
  const best = Math.max(0, ...hits.map((h) => h.len));
  return hits.filter((h) => h.len === best).map((h) => h.it);
}

// "10 high hats, 200 ft 12/2, 2 20A circuits" -> [{qty, unit?, phrase}]
export function parseNote(note) {
  return note.split(/[,\n;]+|\band\b/).map((s) => s.trim()).filter(Boolean).map((s) => {
    const m = s.match(/^(\d+(?:\.\d+)?)\s*(ft|feet|foot|'|sq ?ft|sf|ea|each|bags?|x)?\s+(.*)$/i);
    return m ? { qty: Number(m[1]), phrase: m[3].replace(/^of\s+/i, ""), raw: s } : { qty: null, phrase: s, raw: s };
  });
}

export function estimate(bookData, lines) {
  const { book, rates, settings } = bookData;
  const out = { lines: [], questions: [], math: [] };
  let mat = 0, lab = 0, taxBase = 0;
  for (let l of lines) {
    const m = findItem(book, l.phrase);
    // Grok Bot, 2026-10-16: one-off items (unit "each"/"job"/"lot") with no qty default to 1, stated in the math; measured units still ask.
    if (l.qty == null) {
      if (m.length === 1 && /^(each|ea|job|lot|ls)$/i.test(m[0].unit)) { l = { ...l, qty: 1, assumed: true }; }
      else { out.questions.push(`"${l.raw}": how many?` + (m.length ? "" : " (also not on your price sheet)")); continue; }
    }
    if (m.length === 0) { out.questions.push(`"${l.raw}": not on your price sheet. What do you charge, or which row is it?`); continue; }
    if (m.length > 1) { out.questions.push(`"${l.raw}": matches ${m.map((x) => x.name).join(" / ")}. Which one?`); continue; }
    const it = m[0];
    const pct = it.markup ?? settings.markup;
    const unit = it.sell ?? (it.cost != null && pct != null ? r2(it.cost * (1 + pct / 100)) : null);
    if (unit == null) { out.questions.push(`"${l.raw}" (${it.name}): no sell price, and no markup set. What should I charge per ${it.unit}?`); continue; }
    const rate = it.hours ? rates[norm(it.rate)] : 0;
    if (it.hours && rate == null) { out.questions.push(`"${l.raw}" (${it.name}): labor rate "${it.rate}" isn't on the Labor Rates tab.`); continue; }
    const m$ = r2(l.qty * unit), hrs = r2(l.qty * it.hours), l$ = r2(hrs * (rate || 0));
    mat += m$; lab += l$; if (it.taxable) taxBase += m$;
    out.lines.push({ id: it.id, item: it.name, qty: l.qty, unit: it.unit, unitPrice: unit, materials: m$, taxable: it.taxable, qtyAssumed: !!l.assumed, laborHours: hrs, laborRate: rate || 0, labor: l$, total: r2(m$ + l$) });
    out.math.push(`${it.name}: ${l.qty} ${it.unit}${l.assumed ? " (qty 1 assumed)" : ""}${it.taxable ? "" : " (not taxed)"} x $${unit} = $${m$}` + (hrs ? `; labor ${l.qty} x ${it.hours} h = ${hrs} h x $${rate}/h = $${l$}` : ""));
  }
  const tax = r2(taxBase * settings.tax / 100);
  let total = r2(mat + lab + tax);
  out.math.push(`Materials $${r2(mat)} + tax ${settings.tax}% on taxable $${r2(taxBase)} = $${tax} + labor $${r2(lab)} = $${total}`);
  if (settings.min != null && total < settings.min && out.lines.length) { out.math.push(`Below minimum charge, raised to $${settings.min}`); total = settings.min; }
  Object.assign(out, { materials: r2(mat), tax, labor: r2(lab), total, complete: out.questions.length === 0 });
  return out;
}

export function loadCsvDir(dir) {
  const rd = (f) => { try { return parseCsv(readFileSync(`${dir}/${f}`, "utf8")); } catch { return []; } };
  return loadBook({ items: rd("items.csv"), labor: rd("labor.csv"), settings: rd("settings.csv") });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [dir, ...note] = process.argv.slice(2);
  console.log(JSON.stringify(estimate(loadCsvDir(dir), parseNote(note.join(" "))), null, 2));
}
