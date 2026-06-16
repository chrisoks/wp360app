import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const excludedDirs = new Set(["node_modules", "dist", ".codex-safety", ".git"]);
const includedExtensions = new Set([
  ".css",
  ".html",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".webmanifest",
]);
const mojibakePattern = new RegExp(
  [
    "\\u00c3",
    "\\u00c2",
    "\\ufffd",
    "\\u00e2\\u20ac",
    "\\u00e2\\u20ac\\u201c",
    "\\u00e2\\u20ac\\u0153",
    "\\u00e2\\u20ac\\u009d",
    "\\u00e2\\u20ac\\u2122",
  ].join("|")
);
const findings = [];

function extensionOf(fileName) {
  const match = fileName.match(/(\.[^.]+)$/);
  return match?.[1]?.toLowerCase() ?? "";
}

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (excludedDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walk(path);
      continue;
    }
    if (!includedExtensions.has(extensionOf(entry))) continue;
    const content = readFileSync(path, "utf8");
    const lines = content.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (mojibakePattern.test(line)) {
        findings.push(`${relative(root, path)}:${index + 1}: ${line.trim()}`);
      }
    });
  }
}

walk(root);

if (findings.length > 0) {
  console.error("Moegliche Zeichensatzfehler gefunden:");
  findings.forEach((finding) => console.error(`- ${finding}`));
  process.exit(1);
}

console.log("OK Keine Mojibake-Zeichen gefunden.");
