// Grok Bot, 2026-10-16: price-source adapter interface. Every source returns { items, labor, settings } as rows keyed by the
// price-book template headers, then loadBook() normalizes. Sheet/xlsx/csv are real; ServiceTitan/Jobber/HCP/QBO are stubs (see INTEGRATIONS.md).
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { parseCsv, loadBook } from "../estimate.mjs";
import { readXlsx } from "./xlsx.mjs";

const TABS = { items: "Items", labor: "Labor Rates", settings: "Settings" };

export const csvSource = (dir) => ({ kind: "csv", async read() {
  const rd = (f) => existsSync(path.join(dir, f)) ? parseCsv(readFileSync(path.join(dir, f), "utf8")) : [];
  return { items: rd("items.csv"), labor: rd("labor.csv"), settings: rd("settings.csv") };
} });

export const xlsxSource = (file) => ({ kind: "xlsx", async read() {
  const wb = readXlsx(readFileSync(file));
  return Object.fromEntries(Object.entries(TABS).map(([k, t]) => [k, wb[t] ?? []]));
} });

// Sheets: caller injects a client with getValues(sheetId, tabName) -> 2D array (connector or real API). No creds here.
export const sheetSource = (client, sheetId) => ({ kind: "sheet", async read() {
  const rows = async (t) => { const v = await client.getValues(sheetId, t); const [h, ...r] = v || [[]]; return r.map((x) => Object.fromEntries(h.map((k, i) => [String(k).trim(), String(x[i] ?? "").trim()]))); };
  return { items: await rows(TABS.items), labor: await rows(TABS.labor), settings: await rows(TABS.settings) };
} });

const stub = (kind, why) => ({ kind, async read() { throw new Error(`${kind} price source not built yet: ${why}. Use CSV export -> csvSource for now.`); } });
export const serviceTitanSource = () => stub("servicetitan", "needs ServiceTitan developer/partner app approval + tenant OAuth");
export const jobberSource = () => stub("jobber", "needs Jobber developer app + owner OAuth (GraphQL products/services)");
export const housecallProSource = () => stub("housecallpro", "API is MAX-plan only; needs owner API key");
export const quickBooksSource = () => stub("quickbooks", "needs Intuit developer app + owner OAuth (Item entity)");

export async function loadFrom(source) { return loadBook(await source.read()); }
