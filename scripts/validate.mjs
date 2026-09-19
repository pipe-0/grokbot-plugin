#!/usr/bin/env node
// Structural checks for the pipe0 plugin. No dependencies; run with `node scripts/validate.mjs`.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (msg) => errors.push(msg);
const readJson = (rel) => {
  try {
    return JSON.parse(readFileSync(join(root, rel), "utf8"));
  } catch (e) {
    fail(`${rel}: ${e.message}`);
    return null;
  }
};

const NAME_RE = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const MCP_URL = "https://api.pipe0.com/v1/mcp";

const grok = readJson(".grok-plugin/plugin.json");
const cursor = readJson(".cursor-plugin/plugin.json");
const market = readJson(".grok-plugin/marketplace.json");
const mcpDot = readJson(".mcp.json");
const mcpPlain = readJson("mcp.json");

for (const [rel, m] of [[".grok-plugin/plugin.json", grok], [".cursor-plugin/plugin.json", cursor]]) {
  if (!m) continue;
  if (!NAME_RE.test(m.name ?? "")) fail(`${rel}: name must be kebab-case, got ${JSON.stringify(m.name)}`);
  if (!SEMVER_RE.test(m.version ?? "")) fail(`${rel}: version must be semver, got ${JSON.stringify(m.version)}`);
  if (!m.description) fail(`${rel}: description is required`);
  if (!m.license) fail(`${rel}: license must be stated`);
  if (!m.author?.name) fail(`${rel}: author.name is required`);
  if (m.logo && !existsSync(join(root, m.logo))) fail(`${rel}: logo ${m.logo} does not exist`);
  for (const key of ["skills", "commands", "agents", "rules", "mcpServers", "hooks"]) {
    const v = m[key];
    if (typeof v === "string" && !existsSync(join(root, v))) fail(`${rel}: ${key} path ${v} does not exist`);
    if (typeof v === "string" && v.includes("..")) fail(`${rel}: ${key} must stay inside the plugin root`);
  }
}

if (grok && cursor) {
  if (grok.name !== cursor.name) fail("plugin name differs between the Grok Build and Cursor manifests");
  if (grok.version !== cursor.version) fail(`version differs: grok ${grok.version} vs cursor ${cursor.version}`);
}

if (market) {
  const entry = market.plugins?.find((p) => p.name === grok?.name);
  if (!entry) fail(".grok-plugin/marketplace.json: no entry matching the plugin name");
  if (entry && entry.source !== "./") fail(".grok-plugin/marketplace.json: self-marketplace entry must use source \"./\"");
}

if (mcpDot && mcpPlain) {
  if (JSON.stringify(mcpDot) !== JSON.stringify(mcpPlain)) fail(".mcp.json and mcp.json must be identical");
  const server = mcpDot.mcpServers?.pipe0;
  if (!server) fail(".mcp.json: mcpServers.pipe0 is missing");
  else {
    if (server.type !== "http") fail(`.mcp.json: pipe0 server type must be "http", got ${JSON.stringify(server.type)}`);
    if (server.url !== MCP_URL) fail(`.mcp.json: pipe0 server url must be ${MCP_URL}`);
    if (server.headers) fail(".mcp.json: the server uses OAuth; do not ship static headers");
  }
}

const skillPath = "skills/pipe0/SKILL.md";
if (!existsSync(join(root, skillPath))) fail(`${skillPath} is missing`);
else {
  const text = readFileSync(join(root, skillPath), "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) fail(`${skillPath}: missing YAML frontmatter`);
  else {
    if (!/^name:\s*\S/m.test(fm[1])) fail(`${skillPath}: frontmatter needs name`);
    if (!/^description:\s*\S/m.test(fm[1])) fail(`${skillPath}: frontmatter needs description`);
  }
}

const changelog = existsSync(join(root, "CHANGELOG.md")) ? readFileSync(join(root, "CHANGELOG.md"), "utf8") : "";
if (grok?.version && !changelog.includes(`## ${grok.version}`)) fail(`CHANGELOG.md has no entry for ${grok.version}`);
for (const f of ["README.md", "LICENSE"]) if (!existsSync(join(root, f))) fail(`${f} is missing`);

if (errors.length) {
  console.error("pipe0 plugin validation failed:\n" + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`pipe0 plugin ${grok.version}: all checks passed`);
