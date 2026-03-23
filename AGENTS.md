# Native Skill Core Master Plan

## Vision und Ziele

Dieses Repository soll einen **Native Skill Core** für den Copilot API Gateway beherbergen. Er orchestriert Modelle, Skills, Tools, Memory, Policy und Team‑Entscheidungen in einem **einzigen lokalen Kern**. Ziel ist es, einen **Gold‑Status** zu erreichen: ein produktionsreifes System ohne separaten MCP‑Server, das lokale Ressourcen nutzt und volle Administrative Kontrolle bietet.

**Kernziele**

1. **Ein Kern** – Modelle, Skills, Tools, Memory, Team‑Orchestrierung, Policies, Observability und Admin‑Kontrolle laufen in einem Prozess.
2. **Local‑First** – alles läuft lokal; externe Provider werden nur über konfigurierbare Provider eingebunden.
3. **Umfassende Governance** – Entscheidungen werden im Gedächtnis gespeichert, durch Teams geprüft, durch Policies abgesichert und über Observability nachverfolgbar.
4. **Admin Control Plane** – volle Sichtbarkeit und Steuerung per HTTP‑API und Dashboard.

## Nicht‑Ziele

- Kein Code‑Copy aus SkillPort, mcp‑skillset, Skillz oder den Pi‑Projekten; nur Konzepte.
- Kein eigenständiger MCP‑Server.
- Keine dynamische Codeausführung in diesem Stadium; Skript/Pipeline‑Tools geben einen klaren Hinweis zurück.

## Architekturüberblick

### Model Core
Verwaltet Modell‑Definitionen und Provider‑Abstraktionen. Bietet deterministische Routenwahl, Provider‑Prioritäten und Fallback‑Ketten:contentReference[oaicite:0]{index=0}. Unterstützt VS‑Code‑Modelle, Custom Provider und NVIDIA‑Modelle; Admins können Modelle wechseln.

### Brain Core
Speichert Entscheidungen und Erinnerungen. `MemoryStore` hält Einträge und Snapshots:contentReference[oaicite:1]{index=1}; `DecisionHistory` protokolliert jede Entscheidung mit Metadaten:contentReference[oaicite:2]{index=2}.

### Team Core
Orchestriert Anfragen mit Supervisor-, Worker- und Reviewer‑Rollen. `TeamOrchestrator` erstellt Traces und Steps:contentReference[oaicite:3]{index=3}. `TeamDecision`, `TeamTrace` usw. definieren strukturierte Entscheidungen:contentReference[oaicite:4]{index=4}.

### Policy Core
Bewertet jede Anfrage mit Regeln zum Sperren unsicherer Tools, Beschränken interner Routen und Erzwingen eines Modells:contentReference[oaicite:5]{index=5}.

### Observability Core
Zeichnet Anfragen mit Zeitstempeln auf. `RequestTrace` hält Start‑/Endzeiten, Tool‑Ausführung, Brain‑/Team‑Phasen und Fehler:contentReference[oaicite:6]{index=6}.

### Skill Core
Durchsucht lokale Ordner und Git‑Repos nach Skills (`SKILL.md`), lädt sie lazy und speichert sie in einem Registry.

### Tool Core
Registriert alle Tools aus Skills und importiert gegebenenfalls MCP‑Tools. Validiert Eingaben; Tools können lokal oder per Provider ausgeführt werden.

### Runtime Core
Lädt Skill‑Instruktionen, löst Ressourcen auf und führt Tools aus. Knowledge‑Tools liefern strukturierte Ergebnisse; Skript/Pipeline‑Tools geben “NotImplemented” zurück.

### Repo Manager
Klonen/Updaten von Skill‑Repos in `.vscode/skills‑repos/`, Konflikterkennung bei doppelten IDs.

### Admin Control Plane
`AdminControlService` liefert Status zu Skills, Modellen, Providern, Brain, Team, Policy und Observability; Aktionen: Reindex, Repos syncen, Provider refreshen, Cache invalidieren, Modell wechseln:contentReference[oaicite:7]{index=7}.

### Dashboard
Webview‑Panel in VS Code: Status‑Karten (Skills, Models, Providers, Tools, Brain, Team, Policy, Observability), Logs und Buttons für Admin‑Aktionen. Keine Geschäftslogik im UI.

## Umsetzungsphasen

1. **Phase 0 – Repo‑Aufräumen**: Struktur anlegen (`src/models`, `src/brain`, `src/orchestration`, `src/policy`, `src/observability`, `src/skills`, `src/tools`, `src/admin`, `src/skills/repos`, `docs/architecture`) und Legacy‑Code isolieren.
2. **Phase 1 – Model Core harden**: `ModelRegistry`, `ProviderManager`, `ModelResolver` mit Fallback und Fehlertoleranz implementieren:contentReference[oaicite:8]{index=8}.
3. **Phase 2 – Brain Core**: `MemoryStore` und `DecisionHistory` bauen:contentReference[oaicite:9]{index=9}:contentReference[oaicite:10]{index=10}, Branch/Merge unterstützen.
4. **Phase 3 – Team Core**: Rollen definieren:contentReference[oaicite:11]{index=11}, `TeamOrchestrator` entwickeln:contentReference[oaicite:12]{index=12}, Review‑Loop integrieren.
5. **Phase 4 – Policy Core**: `PolicyEngine` mit ersten Regeln implementieren:contentReference[oaicite:13]{index=13}.
6. **Phase 5 – Observability Core**: `RequestTrace` bauen und über Admin abrufbar machen:contentReference[oaicite:14]{index=14}.
7. **Phase 6 – Skill Core**: Skills aus `.vscode/skills` und Git‑Repos laden und validieren.
8. **Phase 7 – Tool Core**: Tool‑Registry, Skill→Tool‑Mapping, MCP‑Bridge.
9. **Phase 8 – Runtime Core**: Knowledge‑Tools ausführen, NotImplemented für Script/Pipeline.
10. **Phase 9 – Repo Manager**: Git‑Sync, Konflikterkennung.
11. **Phase 10 – Admin Control Plane**: Status‑ und Aktions‑Endpunkte für alle Module:contentReference[oaicite:15]{index=15}.
12. **Phase 11 – Dashboard**: UI erweitern; Karten & Aktionen.
13. **Phase 12 – Integration & Refinement**: Module integrieren, Fehlerfälle testen, Logging härten.
14. **Phase 13 – Gold Status**: End‑to‑end‑Tests, Dokumentation, kein Lint/Type‑Error.

## Teststrategie

Ein **TDD‑Ansatz**: Unit‑Tests für jede Schicht; Integrations‑Tests für komplette Flows (Modellwahl → Team → Policy → Tool → Memory → Trace). Rejection‑Fälle (ungültige Manifeste, doppelte IDs, gesperrte Tools, Provider‑Ausfall) testen. CI muss `npm run lint`, `npm run check‑types`, `npm run compile` ausführen.

## Akzeptanzkriterien (Gold‑Status)

- Modell‑Routing + Fallback stabil; Admin kann Modelle wechseln.
- Brain speichert Entscheidungen; Branch/Merge möglich.
- Team‑Orchestrierung aktiv; jede Anfrage hat Trace mit Route/Model/Tools/Notes.
- Policy blockiert unsichere Tools/Routen.
- Observability protokolliert jede Anfrage.
- Skills & Tools werden gültig geladen; Ungültige werden geloggt.
- Runtime führt Knowledge‑Tools aus; andere liefern klaren Hinweis.
- Repos werden synchronisiert; Konflikte erkannt.
- Admin Control Plane liefert Daten und führt Aktionen aus.
- Dashboard zeigt Status & Logs; Buttons lösen Aktionen aus.

## Quellen

- **ModelResolver** – deterministische Modellwahl & Fallback:contentReference[oaicite:16]{index=16}.
- **MemoryStore / DecisionHistory** – Gedächtnis & Entscheidungsverlauf:contentReference[oaicite:17]{index=17}:contentReference[oaicite:18]{index=18}.
- **TeamOrchestrator / teamTypes** – Team‑Orchestrierung:contentReference[oaicite:19]{index=19}:contentReference[oaicite:20]{index=20}.
- **PolicyEngine** – Regeln & Entscheidungen:contentReference[oaicite:21]{index=21}.
- **RequestTrace** – Observability‑Tracing:contentReference[oaicite:22]{index=22}.
- **AdminControlService** – Admin‑Operationen & Status:contentReference[oaicite:23]{index=23}.