#!/usr/bin/env node
// Grok Bot, 2026-10-15: zero-dependency stdio MCP server (newline-delimited JSON-RPC) so the plugin ships no node_modules/binaries.
import readline from "node:readline";
import { TOOLS } from "./tools.mjs";
import { makeBackend, ToolError } from "./store.mjs";

export async function handle(msg, backend) {
  const { id, method, params = {} } = msg;
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  switch (method) {
    case "initialize":
      return ok({ protocolVersion: params.protocolVersion || "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "smb-ops-pipeline", version: "0.1.0" } });
    case "ping": return ok({});
    case "tools/list":
      return ok({ tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })) });
    case "tools/call": {
      const t = TOOLS.find((x) => x.name === params.name);
      if (!t) return { jsonrpc: "2.0", id, error: { code: -32602, message: `Unknown tool ${params.name}` } };
      try {
        const r = await t.run(backend, params.arguments || {});
        return ok({ content: [{ type: "text", text: JSON.stringify(r) }], structuredContent: Array.isArray(r) ? { items: r } : r });
      } catch (e) {
        return ok({ isError: true, content: [{ type: "text", text: e instanceof ToolError ? e.message : `Internal error: ${e.message}` }] });
      }
    }
    default:
      if (id === undefined) return null; // notification
      return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const backend = await makeBackend();
  const rl = readline.createInterface({ input: process.stdin });
  let chain = Promise.resolve();
  rl.on("line", (line) => {
    if (!line.trim()) return;
    chain = chain.then(async () => {
      let msg; try { msg = JSON.parse(line); } catch { process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }) + "\n"); return; }
      const res = await handle(msg, backend);
      if (res) process.stdout.write(JSON.stringify(res) + "\n");
    });
  });
}
