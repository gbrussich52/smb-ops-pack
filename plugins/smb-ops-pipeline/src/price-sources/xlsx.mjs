// Grok Bot, 2026-10-16: minimal dependency-free .xlsx reader (zip + sheet XML) so owners can hand the bot their Excel file.
import { inflateRawSync } from "node:zlib";

function unzip(buf) {
  let e = buf.length - 22; while (e >= 0 && buf.readUInt32LE(e) !== 0x06054b50) e--;
  if (e < 0) throw new Error("not an xlsx/zip file");
  const n = buf.readUInt16LE(e + 10); let p = buf.readUInt32LE(e + 16); const files = {};
  for (let i = 0; i < n; i++) {
    const method = buf.readUInt16LE(p + 10), size = buf.readUInt32LE(p + 20), nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), off = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nl);
    const ds = off + 30 + buf.readUInt16LE(off + 26) + buf.readUInt16LE(off + 28);
    const raw = buf.subarray(ds, ds + size);
    files[name] = method === 8 ? inflateRawSync(raw) : raw;
    p += 46 + nl + xl + cl;
  }
  return files;
}
const unxml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const col = (ref) => [...ref.replace(/\d+/g, "")].reduce((a, c) => a * 26 + c.charCodeAt(0) - 64, 0) - 1;

export function readXlsx(buf) {
  const f = unzip(buf), txt = (k) => f[k]?.toString("utf8") ?? "";
  const shared = [...txt("xl/sharedStrings.xml").matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => unxml([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((t) => t[1]).join("")));
    const attr = (tag, a) => (tag.match(new RegExp(`\\s${a}="([^"]*)"`)) || [])[1];
  const rels = Object.fromEntries([...txt("xl/_rels/workbook.xml.rels").matchAll(/<Relationship [^>]*>/g)].map((m) => [attr(m[0], "Id"), attr(m[0], "Target")]));
  const out = {};
  for (const tag of txt("xl/workbook.xml").matchAll(/<sheet [^>]*>/g)) {
    const m = [null, attr(tag[0], "name"), attr(tag[0], "r:id")];
    const target = rels[m[2]].replace(/^\/?(xl\/)?/, "xl/");
    const grid = [];
    for (const r of txt(target).matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
      const row = [];
      for (const c of r[1].matchAll(/<c r="([A-Z]+\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
        const t = (c[2].match(/t="(\w+)"/) || [])[1], body = c[3] || "";
        const v = (body.match(/<v>([\s\S]*?)<\/v>/) || [])[1], is = (body.match(/<t[^>]*>([\s\S]*?)<\/t>/) || [])[1];
        row[col(c[1])] = t === "s" ? shared[+v] : t === "inlineStr" ? unxml(is || "") : unxml(v ?? "");
      }
      grid.push(Array.from(row, (x) => x ?? ""));
    }
    const [h = [], ...rest] = grid.filter((g) => g.some((x) => String(x).trim()));
    out[unxml(m[1])] = rest.map((x) => Object.fromEntries(h.map((k, i) => [String(k).trim(), String(x[i] ?? "").trim()]).filter(([k]) => k)));
  }
  return out;
}
