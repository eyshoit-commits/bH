# Native Skill Core Master Plan

## Feature Inventory

### Extracted from SkillPort
- Local folder-based discovery (`.vscode/skills` by default) with configurable roots.
- `SKILL.md` manifests that carry YAML frontmatter and metadata-first loading semantics.
- Lazy manifest parsing with early reject logging for malformed YAML or missing required fields.
- Refresh/reindex triggers so the gateway can rediscover without relying on an MCP or CLI.

### Extracted from mcp-skillset
- Search/index concepts covering metadata-only scanning plus on-demand full loads.
- Tool registries with bidirectional mappings between skills and tools, including validation hooks.
- Metadata ranking heuristics (tags, categories, term matching).
- Local runtime ideas for invoking file-based resources without cloud dependencies.

### Extracted from skillz
- Canonical schema for skill metadata (id, name, version, description, tags, categories, sources).
- Git repo as a discovery source with sync, update, and reconcile flows.
- Rejection/error logs with actionable context (skill path, error message, timestamp).
- Capability tagging and provider/source tracking for admin visibility.

### Extracted from local-skills-mcp
- Local runtime mindset: everything executes inside one process without external server components.
- File watchers with debounced reindex and selective reload (future phase).
- Tool/input validation baked into the core rather than offloaded to MCP definitions.

### Improvements added for this core
- Single gateway-native discovery+registry rather than separate MCP/sidecar stack.
- TypeScript validation layer that produces deterministic, normalized `CoreSkill` objects.
- In-memory registry shared by HTTP handlers, runtime, search, and admin UI.
- Persistent admin control plane inside the existing VS Code extension UI surface.
- Actions for reindexing, repo sync, discovery refresh, cache invalidation, and source toggles.
- Combined status view for skills, tool registry, providers, repos, and rejection logs.

### Non-goals (explicit exclusions)
- No MCP server, CLI, sidecar, or external runtime.
- No copy-paste—only conceptual inspiration from reference projects.
- No separate dashboard application; everything lives inside the current VS Code extension surface.
- No duplicate storage/cache systems or “load everything into context” behavior.

## Architecture Overview
- **Discovery:** `src/skills/fs` scans configured folders and repo sources, reads `SKILL.md` manifests, validates required fields (`id`, `name`, `version`, `description`), and produces normalized metadata-only snapshots.
- **Registry:** `src/skills/registry` holds canonical `CoreSkill` objects, enforces unique identifiers, stores rejection logs, tracks source/provider metadata, and exposes snapshots sorted deterministically for APIs and the admin UI.
- **Search & Tool Layers (Phase 2/3):** Index builders consume the registry for metadata-level search, tag/category filtering, and ranking; tool registries map skills to runnable definitions with strict input validation.
- **Runtime:** Local runtime modules load instructions/resources and invoke tools entirely inside the gateway (no external processes).
- **Repo Sources:** Git repos registered in `src/skills/repos` act as additional discovery roots; sync + reindex orchestration keeps the registry fresh without MCP sync loops.
- **Admin Control Plane:** Embedded VS Code panels reuse the existing extension UI (extend `src/dashboard` if it already exists; otherwise build modular cards inside the current surface). They consume the shared registry/status services and dispatch actions (reindex, sync, refresh).
- **HTTP Surface:** Gateway endpoints expose the registry, search results, tools, execution actions, and admin metrics. Admin commands and the UI rely on the same services, ensuring one canonical state.

## Phase Map
1. **Skill Core (read-only):** Discovery + manifest parsing + validation + registry population + `GET /v1/skills`.
2. **Search / Index:** Build local index (full text, tags, categories), ranking heuristics, and `GET /v1/skills/search`.
3. **Tool Layer:** Tool registry, skill↔tool mappings, validated input schemas, and `GET /v1/tools`.
4. **Local Runtime:** Instruction loading, resource resolution, tool invocation with `POST /v1/tools/execute`.
5. **Repo Sources:** Git repo sync/orchestration, branch support, local mirroring, `.git` cleanup, and `POST /v1/skills/repos/sync`.
6. **Versioning:** Version snapshots/backups `versions/{version}`, list/rollback, semver patch bumps on conflict.
7. **Hot Reload:** Debounced file watcher with added/modified/removed handling, selective reindex.
8. **Admin / Dashboard:** Extend the VS Code extension UI with panels/cards for Skill Core status, Tool Registry health, Provider status, Repo sync, rejection logs, and admin actions.

## API Goals
- `GET /v1/skills`
- `GET /v1/skills/search`
- `GET /v1/tools`
- `POST /v1/tools/execute`
- `POST /v1/skills/reindex`
- `POST /v1/skills/repos/sync`
- `GET /v1/admin/skills/status`
- `GET /v1/admin/providers/status`
- `GET /v1/admin/logs/skills`
- `POST /v1/admin/cache/invalidate`

## Dashboard & Admin Requirements
- Display skill metadata (id, name, version, tags, category, source) and last load time.
- Show tool registry coverage (tools per skill, tool types, enabled vs. disabled) and last validation pass.
- Provider status card: local paths, repo sources, last discovery/reindex timestamp, and enabled toggle states.
- Repo sync status: last sync time, available branches, sync health.
- Rejection/error log listing skill path, manifest errors, timestamp, and stack trace.
- Admin actions: `Reindex Skills`, `Sync Repo Sources`, `Refresh Discovery`, `Invalidate Cache`, `Enable/Disable Sources`.
- Panel layout must be embedded inside the existing VS Code extension UI (no separate React/Browser app). If `src/dashboard` exists, extend it; otherwise add modular cards structured for future migration.

## Test Strategy
- **Manifest validation:** valid skill, missing `id`, missing `version`, invalid YAML, duplicate `id`, empty folder, invalid path, rejection logging.
- **Registry:** registration success, duplicate detection, empty snapshot, consistent ordering, rejection log entries, config path fallbacks.
- **API:** `GET /v1/skills` returns data when available and empty list otherwise; respects default/custom discovery paths.
- **Integration:** health-check for admin endpoints once built; admin UI manual verification to confirm panels/actions reflect backend state.
- **Quality gates:** typecheck, lint, compile, and test suite run before declaring this “production ready.”

## Task Plan (Phase 1 focus, but capturing downstream context)

### Phase 1 — Read-Only Discovery + Registry (Immediate Coding Target)
| File | Purpose | Acceptance Criteria | Tests | Notes |
| --- | --- | --- | --- | --- |
| `src/skills/types.ts` | Define canonical `CoreSkill`, discovery config, rejection metadata, and helper guards. | `CoreSkill` includes `id`, `slug`, `name`, `version`, `description`, `tags`, `categories`, `source`, `path`, `repoUrl`, `enabled`, `updatedAt`, `tools`, `modelHints`, `capabilityTags`. Discovery config exposes default `.vscode/skills` and allows overrides. | Type-level compile checks; runtime guards for required fields; unit test verifying guard rejects missing props. | Keep helpers simple so downstream phases can reuse guards without duplication. |
| `src/skills/fs/readSkillManifest.ts` | Load `SKILL.md`, parse YAML frontmatter, enforce required fields, normalize values, and return `CoreSkill` metadata or structured rejection reason. | Handles valid manifests (returns normalized metadata) and logs detailed rejection reasons for invalid/malformed manifests without throwing. | Unit tests: valid skill, missing `id`, missing `version`, invalid YAML, duplicate `id`, rejection logging. | Rejections recorded centrally (registry reads log). Normalization ensures deterministic ordering. |
| `src/skills/fs/discoverSkills.ts` | Scan configured discovery path (default `.vscode/skills`), identify skill folders, lazily invoke manifest loader, support refresh/reindex signals, handle invalid/empty folders gracefully. | Discovery yields metadata-only entries, exposes last refresh timestamp, handles non-existent path without crashing, and can re-scan on command. | Tests: empty folder, invalid path, custom discovery root, refresh triggers re-scan. | Design for eventual watcher integration (Phase 7). |
| `src/skills/registry/skillRegistry.ts` | Maintain in-memory registry, accept new `CoreSkill`s, enforce unique `id`s, expose sorted snapshot for `GET /v1/skills`, store rejection/log entries, track last refresh/sync timestamp. | Deterministically sorted output, rejects duplicates with log entry, exposes last refresh timestamp and rejection list. | Registry tests: successful register, duplicate detection, rejection log entry creation, empty snapshot, default/custom path handling. | Registry should expose read-only snapshot for API/server and admin UI. |

### Phase 2 — Search / Index (planning context)
- `src/skills/search/buildSkillIndex.ts`: Build full-text/tag/category indexes from registry metadata, support incremental updates, and expose ranking weights.
- `src/skills/search/searchSkills.ts`: Query the index with keyword/tag inputs, filter by source/category, and fall back to metadata-only ranking.
- `src/skills/search/rankSkills.ts`: Apply heuristics prioritizing metadata matches, recency, and optional future embeddings.

### Phase 3 — Tool Layer (planning context)
- `src/tools/toolRegistry.ts`: Map skills to tools (knowledge/script/pipeline types), store enabled flags, track dependencies, expose `GET /v1/tools`.
- `src/tools/registerSkillTools.ts`: Register tool definitions from each skill manifest, validate input/output schemas, and populate helper data for runtime.
- `src/tools/validateToolInput.ts`: Validate incoming tool execution payloads against registered schemas before runtime invocation.

### Phase 4 — Local Runtime (context)
- `src/skills/runtime/loadSkillInstructions.ts`: Read instructions/resources referenced by a skill and prepare them for execution.
- `src/skills/runtime/resolveSkillResources.ts`: Resolve file paths, handle dependencies, and prepare a runtime context.
- `src/skills/runtime/invokeSkillTool.ts`: Execute a skill tool locally and return structured responses for `POST /v1/tools/execute`.

### Phase 5+ — Repo Sources, Versioning, Hot Reload, Admin UI (context)
- Repo sync plan documents to follow once Phase 1–4 stabilize (already referenced in `docs/plans/2026-03-23-native-skill-core-phaseX` files).
- Admin UI will reuse existing VS Code extension panels; when ready it will consume the same registry/status services defined above.
