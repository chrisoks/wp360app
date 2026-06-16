# WorkPilot360 PWA

Eigenes PWA-Frontend für WorkPilot360. Die App liegt bewusst getrennt vom Hauptprogramm und liest die vorhandenen APIs.

## Lokal starten

1. WorkPilot360 Hauptprogramm starten:

```powershell
cd "C:\Users\vagte\Downloads\Dokumenteauslastungdashboardhero\WorkPilot360"
npm.cmd run dev:local -- -p 3001
```

2. PWA starten:

```powershell
cd "C:\Users\vagte\Downloads\Dokumenteauslastungdashboardhero\PWA_WorkPilot360"
npm.cmd run dev -- --port 3010
```

3. Öffnen:

```text
http://127.0.0.1:3010
```

## Verbindung

In der lokalen Entwicklung leitet Vite alle `/api/...` Anfragen an `http://localhost:3001` weiter.

Fuer eine Online-Version gibt es zwei saubere Wege:

- PWA unter derselben Domain wie WorkPilot360 ausliefern, dann bleibt `VITE_WORKPILOT_API_BASE` leer.
- PWA separat hosten und `VITE_WORKPILOT_API_BASE` auf die WorkPilot360-Domain setzen.

## Enthalten

- Installierbare PWA mit Manifest und Service Worker
- Mobile Startseite mit offenen Aufgaben, Planung und Benachrichtigungen
- Aufgabenliste mit Status-Aktionen
- Projektübersicht für die WorkPilot360-Projekte
- Kontakte, Team und Abwesenheiten
- Offline-Cache für App-Shell und zuletzt gelesene GET-Antworten
