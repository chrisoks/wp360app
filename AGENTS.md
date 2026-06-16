# AGENTS.md

## Projektkontext

Dieses Repository ist ausschliesslich die WorkPilot360 PWA.

- PWA-Projekt: `C:\Users\vagte\Downloads\Dokumenteauslastungdashboardhero\PWA_WorkPilot360`
- Hauptprogramm: `C:\Users\vagte\Downloads\Dokumenteauslastungdashboardhero\WorkPilot360`

Das Hauptprogramm darf aus diesem Projekt heraus nur gelesen werden. Aenderungen am Hauptprogramm gehoeren in den separaten Hauptprogramm-Chat.

## Arbeitsregeln

- Vor jeder groesseren Aenderung zuerst sicherstellen, dass der aktuelle Ordner `PWA_WorkPilot360` ist.
- Keine Dateien im Ordner `WorkPilot360` schreiben, verschieben oder loeschen.
- Die PWA bleibt an die bestehenden WorkPilot360 APIs angebunden. Keine doppelte Fachlogik erfinden, wenn das Hauptprogramm bereits einen zentralen Endpunkt hat.
- Stempeluhr-Funktionen muessen weiter ueber `/api/stamp-session` laufen.
- Abschlusskontrollen muessen weiter ueber `/api/final-inspections` laufen.
- Die PWA muss mobil gut nutzbar bleiben.

## Safety

Vor und nach relevanten Aenderungen einen Safety-Snapshot erzeugen:

```powershell
npm.cmd run safety:before
npm.cmd run safety:after
```

Die Dateien liegen danach unter `.codex-safety/`.

## Checks

Vor Abschluss einer Aenderung ausfuehren:

```powershell
npm.cmd run check
```

Einzelchecks:

```powershell
npm.cmd run check:regression
npm.cmd run check:mojibake
npm.cmd run check:typescript
npm.cmd run check:diff
```

## Lokaler Start

Hauptprogramm separat starten:

```powershell
cd "C:\Users\vagte\Downloads\Dokumenteauslastungdashboardhero\WorkPilot360"
npm.cmd run dev:local -- -p 3001
```

PWA starten:

```powershell
cd "C:\Users\vagte\Downloads\Dokumenteauslastungdashboardhero\PWA_WorkPilot360"
npm.cmd run dev -- --port 3010
```

URL:

```text
http://127.0.0.1:3010
```
