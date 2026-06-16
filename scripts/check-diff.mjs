import { existsSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";

const root = process.cwd();
const expectedProject = "PWA_WorkPilot360";
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const agentsPath = join(root, "AGENTS.md");

const checks = [
  {
    label: "Check laeuft im PWA-Projektordner",
    ok: basename(root) === expectedProject,
  },
  {
    label: "Package gehoert zur WorkPilot360 PWA",
    ok: packageJson.name === "workpilot360-pwa",
  },
  {
    label: "AGENTS.md ist vorhanden",
    ok: existsSync(agentsPath),
  },
];

const failed = checks.filter((check) => !check.ok);
for (const check of checks) {
  console.log(`${check.ok ? "OK" : "FEHLER"} ${check.label}`);
}

if (failed.length > 0) {
  console.error(`\nDiff-/Kontextcheck fehlgeschlagen: ${failed.length} Punkt(e) pruefen.`);
  process.exit(1);
}
