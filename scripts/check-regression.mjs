import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const appPath = join(root, "src", "App.tsx");
const manifestPath = join(root, "public", "manifest.webmanifest");
const serviceWorkerPath = join(root, "public", "service-worker.js");

const app = readFileSync(appPath, "utf8");
const checks = [
  {
    label: "Zentrale Stempelsession API",
    ok: app.includes("/api/stamp-session"),
  },
  {
    label: "Endkontrolle wird ueber Hauptprogramm-API gespeichert",
    ok: app.includes("/api/final-inspections"),
  },
  {
    label: "Projekt- und unproduktive Stempelung bleiben vorhanden",
    ok: app.includes('"project"') && app.includes('"unproductive"') && app.includes("setStampMode"),
  },
  {
    label: "Pause, Fortsetzen, Stop und Wechsel bleiben in der Stempeluhr erhalten",
    ok:
      app.includes('"pause"') &&
      app.includes('"resume"') &&
      app.includes('"stop"') &&
      app.includes('"switch"'),
  },
  {
    label: "Planungsboard und persoenlicher Bereich bleiben erreichbar",
    ok: app.includes('id: "planning"') && app.includes('id: "personal"'),
  },
  {
    label: "PWA Manifest und Service Worker sind vorhanden",
    ok: existsSync(manifestPath) && existsSync(serviceWorkerPath),
  },
];

const failed = checks.filter((check) => !check.ok);
for (const check of checks) {
  console.log(`${check.ok ? "OK" : "FEHLER"} ${check.label}`);
}

if (failed.length > 0) {
  console.error(`\nRegressionscheck fehlgeschlagen: ${failed.length} Punkt(e) pruefen.`);
  process.exit(1);
}
