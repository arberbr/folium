import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const supported = new Set([".css", ".cjs", ".cts", ".js", ".json", ".jsonc", ".jsx", ".mjs", ".mts", ".ts", ".tsx"]);

function extractPath(payload) {
  if (!payload || typeof payload !== "object") return null;

  const candidates = [
    payload.file_path,
    payload.filePath,
    payload.path,
    payload.uri,
    payload.tool_input?.path,
    payload.tool_input?.file_path,
    payload.tool_input?.filePath,
    payload.input?.path,
    payload.input?.file_path,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) {
      return candidate.replace(/^file:\/\//, "");
    }
  }

  return null;
}

const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(chunk);
}

let payload = {};
const raw = Buffer.concat(chunks).toString("utf8").trim();
if (raw) {
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = {};
  }
}

const filePath = extractPath(payload);
if (!filePath) process.exit(0);

const abs = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);
if (!supported.has(path.extname(abs).toLowerCase()) || !existsSync(abs)) {
  process.exit(0);
}

const biomeBin = path.join(root, "node_modules", "@biomejs", "biome", "bin", "biome");
if (!existsSync(biomeBin)) process.exit(0);

const result = spawnSync(
  process.execPath,
  [
    biomeBin,
    "check",
    "--write",
    "--files-ignore-unknown=true",
    "--no-errors-on-unmatched",
    abs,
  ],
  { cwd: root, encoding: "utf8" },
);

if (result.stdout) process.stderr.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

process.exit(0);
