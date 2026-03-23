Wir bauen ein produktionsreifes Native Skill Core System in:

https://github.com/eyshoit-commits/bH

KRITISCHE REGELN:

- KEIN MCP-Server
- KEINE externen Services
- KEINE Sidecar-Architektur
- KEIN Copy-Paste aus Referenz-Repos
- ALLES wird von Grund auf in TypeScript neu implementiert
- ALLES läuft im bestehenden API Gateway (CopilotApiGateway)
- Dashboard/Admin Panel MUSS erweitert werden
- Das System ist LOCAL-FIRST

Referenzprojekte (nur Feature-Extraktion, KEIN Code übernehmen):
- https://github.com/gotalab/skillport
- https://github.com/bobmatnyc/mcp-skillset
- https://github.com/Algiras/skillz
- https://github.com/kdpa-llc/local-skills-mcp

==================================================
TEIL 1 — FEATURES DIE ÜBERNOMMEN UND NEU GEBAUT WERDEN
==================================================

1. Skill Discovery (SkillPort + local-skills-mcp)
- lokale Skill-Ordner
- SKILL.md als Manifest
- Lazy Loading
- Reindex / Refresh

NEU:
- Discovery direkt im Gateway
- konfigurierbarer Pfad (Default: .vscode/skills)
- kein MCP, keine CLI

--------------------------------------------------

2. Skill Manifest + Validierung (SkillPort)
- Pflichtfelder prüfen
- Schema-Validierung
- fehlerhafte Skills ablehnen

NEU:
- TypeScript Validation Layer
- harte Reject-Regeln
- strukturiertes Logging

--------------------------------------------------

3. Skill Metadata + Registry (SkillPort + Skillz)
- id, name, version, description
- tags, categories
- source (local/git/bundled/provider)

NEU:
- ein einheitliches CoreSkill-Schema
- In-Memory Registry
- deterministische Sortierung

--------------------------------------------------

4. Search / Index (SkillPort + mcp-skillset)
- search_skills(query)
- Metadata-first loading
- Ranking

NEU:
- lokaler Suchindex
- Volltext + Tag + Kategorie
- KEINE Embeddings in Phase 1

--------------------------------------------------

5. Tool Registry (mcp-skillset)
- Tool Definitionen
- Skill → Tool Mapping
- Input Schema

NEU:
- native ToolRegistry im Gateway
- keine MCP-Abhängigkeit

--------------------------------------------------

6. Lokale Runtime (local-skills-mcp)
- lokale Skill-Ausführung
- file-based runtime

NEU:
- Execution direkt im Gateway
- keine Subprozesse
- keine externe Runtime

--------------------------------------------------

7. Repo Sources (Skillz)
- Skills aus Git laden
- Sync / Update

NEU:
- Repo als Quelle
- Gateway steuert Sync + Reindex

--------------------------------------------------

8. Admin Control Plane (NEU)

Admin muss sehen:
- geladene Skills
- Tool Registry Status
- Provider Status
- abgelehnte Skills
- Parse-Fehler
- letzte Reindex-Zeit
- letzte Sync-Zeit

Admin muss können:
- Skills reindexen
- Repo-Quellen synchronisieren
- Provider-Discovery refreshen
- Cache leeren
- Quellen aktivieren/deaktivieren

==================================================
TEIL 2 — WAS NICHT EXISTIEREN DARF
==================================================

- kein MCP-Server
- keine externe Runtime
- keine CLI-Abhängigkeit
- kein zweites State-System
- keine UI-Logik ohne Core
- kein „alles in Kontext laden“
- kein Copy-Paste-Design

==================================================
TEIL 3 — SYSTEMARCHITEKTUR
==================================================

Alles läuft in EINEM Core:

Gateway Core =

- VS Code Models
- Custom Providers
- Skill Discovery
- Skill Registry
- Search Index
- Tool Registry
- Runtime Engine
- Repo Sources
- Admin Control Plane

KEIN zweites System.

==================================================
TEIL 4 — IMPLEMENTIERUNGSPHASEN
==================================================

PHASE 1 — Skill Core (READ-ONLY)

Dateien:
- src/skills/types.ts
- src/skills/fs/readSkillManifest.ts
- src/skills/fs/discoverSkills.ts
- src/skills/registry/skillRegistry.ts

Funktion:
- Skills aus lokalem Pfad laden
- SKILL.md (YAML Frontmatter) parsen
- Pflichtfelder validieren:
  id, name, version, description
- ungültige Skills ablehnen
- CoreSkill erzeugen
- Registry füllen

API:
GET /v1/skills

--------------------------------------------------

PHASE 2 — SEARCH

Dateien:
- src/skills/search/buildSkillIndex.ts
- src/skills/search/searchSkills.ts
- src/skills/search/rankSkills.ts

API:
GET /v1/skills/search

--------------------------------------------------

PHASE 3 — TOOL SYSTEM

Dateien:
- src/tools/toolRegistry.ts
- src/tools/registerSkillTools.ts
- src/tools/validateToolInput.ts

API:
GET /v1/tools

--------------------------------------------------

PHASE 4 — RUNTIME

Dateien:
- src/skills/runtime/loadSkillInstructions.ts
- src/skills/runtime/resolveSkillResources.ts
- src/skills/runtime/invokeSkillTool.ts

API:
POST /v1/tools/execute

--------------------------------------------------

PHASE 5 — REPO SOURCES

Dateien:
- src/skills/repos/skillRepoRegistry.ts
- src/skills/repos/syncSkillRepo.ts

API:
POST /v1/skills/repos/sync

--------------------------------------------------

PHASE 6 — ADMIN CONTROL PLANE

WICHTIG:
Dashboard und HTTP nutzen dieselbe Core-Logik

Core Service:
- AdminControlService

Funktionen:
- reindexSkills()
- syncSkillRepos()
- refreshProviders()
- invalidateCache()
- getSkillStatus()
- getProviderStatus()
- getSkillLogs()

HTTP:
- GET /v1/admin/skills/status
- GET /v1/admin/providers/status
- GET /v1/admin/logs/skills
- POST /v1/admin/skills/reindex
- POST /v1/admin/skills/repos/sync
- POST /v1/admin/providers/refresh
- POST /v1/admin/cache/invalidate

Dashboard:
- ruft dieselben Endpunkte auf
- enthält KEINE Business-Logik

==================================================
TEIL 5 — TEST-STRATEGIE
==================================================

Pflicht:

TDD (RED → GREEN → REFACTOR)

Tests:

- valid skill
- missing id
- missing version
- invalid YAML
- duplicate id
- empty directory
- invalid path
- rejection logging
- GET /v1/skills mit Daten
- GET /v1/skills leer
- config default path
- config custom path

KEIN „production ready“ ohne:
- Unit Tests
- Integration Tests
- typecheck
- lint
- compile

==================================================
TEIL 6 — AUFGABE
==================================================

Schritt 1:
Erstelle eine vollständige Markdown-Datei im Repo mit:
- Feature-Liste
- Architektur
- Phasen
- API-Definitionen
- Admin-Requirements
- Teststrategie
- Non-Goals

Schritt 2:
Erstelle einen detaillierten Task-Plan:
- pro Phase
- pro Datei
- mit Zweck
- mit Acceptance Criteria
- mit Tests

Schritt 3:
KEINE:
- vagen Zusammenfassungen
- Marketingtexte
- halbfertigen Ideen

Schritt 4:
Output muss direkt implementierbar sein

STARTE JETZT.