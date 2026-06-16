import { createHash } from "node:crypto";
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const phase = process.argv[2] === "after" ? "after" : "before";
const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
const safetyDir = join(root, ".codex-safety");
const excludedDirs = new Set(["node_modules", "dist", ".codex-safety", ".git"]);
const includedExtensions = new Set([
  ".css",
  ".html",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".webmanifest",
]);

function extensionOf(fileName) {
  const match = fileName.match(/(\.[^.]+)$/);
  return match?.[1]?.toLowerCase() ?? "";
}

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (excludedDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      collectFiles(path, files);
      continue;
    }
    if (includedExtensions.has(extensionOf(entry))) {
      files.push(path);
    }
  }
  return files;
}

mkdirSync(safetyDir, { recursive: true });

const lines = [
  `# Safety snapshot ${phase} ${stamp}-pwa-safety-checks`,
  "# Project: PWA_WorkPilot360",
  "# Format: file listing with SHA256",
  "",
];

for (const file of collectFiles(root).sort()) {
  const content = readFileSync(file);
  const hash = createHash("sha256").update(content).digest("hex").toUpperCase();
  lines.push(`--- ${relative(root, file).replaceAll("\\", "/")}`);
  lines.push(`sha256 ${hash}`);
}

const target = join(safetyDir, `current-${phase}-${stamp}-pwa-safety-checks.patch`);
writeFileSync(target, `${lines.join("\n")}\n`, "utf8");
console.log(target);
