# Native Skill Core Implementation Design

## Overview
- **Goal:** Implement a native skill core inside the bH API Gateway and VS Code extension, replacing MCP/sidecar concepts with in-process TypeScript modules and embedding an admin UI into the existing extension surface.
- **Primary constraints:** No external runtime or CLI; no duplicative dashboard; all components share the same gateway state.
- **Key outcomes:** Discovery, registry, search, tools, runtime, provider sources, and admin controls exist as cohesive layers inside `src/`, with the VS Code UI presenting status, logs, and actions close to the gateway backend.

## Architecture
- **Discovery → Registry → API/UI Pipeline:** The discovery module reads `SKILL.md` manifests, validates/normalizes them, and feeds a canonical `CoreSkill` schema into an in-memory registry. HTTP handlers and admin UI read snapshots from the registry rather than re-parsing manifests.
- **Stateful but read-only Phase 1:** The registry exposes deterministic listings (sorted by `source` + `name`) for `GET /v1/skills`, plus rejection logs and metadata-only access for future search/tool layers.
- **Admin control plane living in VS Code extension:** Status cards/panels are part of the existing extension UI surface (extend `src/dashboard` if it exists), issuing commands that invoke the shared backend services. Future growth stays within the same UI surface, with backend hooks already in place.

## Components
- **Skill Discovery:** `src/skills/fs` scans configured folders, reads YAML frontmatter from `SKILL.md`, validates required fields (`id`, `name`, `version`, `description`), enforces deterministic normalization, and reports rejects early. Configurable default path `.vscode/skills` with overrides.
- **Skill Registry:** `src/skills/registry` maintains `CoreSkill` objects, rejects duplicates, stores rejection logs, tracks last refresh timestamps, and allows read-only snapshots consumed by API endpoints.
- **Admin Status Services:** Provide metadata on loaded skills, tool registry placeholders, provider statuses, repo sync states, rejection log entries, and caches. Admin actions (reindex, discovery refresh, cache invalidate, repo sync) call services inside the gateway and update the registry state.
- **Existing API Handlers:** Extend `src/api` (or equivalent routing layer) with `GET /v1/skills`, wiring to the registry snapshot.
- **VS Code UI Panels:** Use existing extension UI (dashboard area or main views) to display status cards (skills, tool registry, providers, repos, rejections) and trigger actions via commands or HTTP calls to the gateway internal endpoints.

## Admin UI Flow
- **Status Cards:** show counts/timestamps (skills loaded, last refresh, tool registry status, provider status, repo sync status, rejection count).
- **Action Buttons:** `Reindex Skills`, `Sync Repo Sources`, `Refresh Discovery`, `Invalidate Cache` wired to backend services via command handlers.
- **Log Output:** Display rejection/error log with time, skill folder, and error message; add auto-refresh capability tied to backend events or manual refresh button.

## APIs & Endpoints
- Phase 1: `GET /v1/skills` returns registry snapshot.
- Future: `GET /v1/skills/search`, `GET /v1/tools`, `POST /v1/tools/execute`, `POST /v1/skills/reindex`, `POST /v1/skills/repos/sync`, `GET /v1/admin/...`, `POST /v1/admin/cache/invalidate`.
- Admin actions in the UI should interact with POST endpoints or command handlers that call the same services the API uses.

## Testing Strategy
- TDD for manifest parsing/validation (`valid skill`, `missing id`, `missing version`, `invalid YAML`, `duplicate id`, `random errors`, `empty folder`, `invalid path`).
- Registry tests: successful registration, duplicate detection, empty snapshot, rejection logging.
- API tests: `GET /v1/skills` returns expected data set or empty list; config path overrides.
- Lint, typecheck, compile, and manual admin UI verification once integrated.

## Notes
- The NetSkill Core is intentionally modular (Discovery, Registry, Runtime, Search, Tools, Repos, UI) but all modules share the same process and registry state.
- Admin UI must not introduce a new frontend runtime; it is limited to the existing VS Code extension surface.

