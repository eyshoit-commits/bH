# Native Skill Core Master Plan

## Feature List
- **Skill Discovery:** Gateway performs discovery of local skill folders (default `.vscode/skills`) with configurable root paths, lazy loading, refresh triggers, and on-demand reindexing without any MCP server or CLI involvement.
- **Skill Manifest + Validation:** Manifests live in `SKILL.md` files with YAML frontmatter. The loader enforces required fields (`id`, `name`, `version`, `description`), applies deterministic normalization, validates schema via TypeScript types/guards, rejects invalid skills, and logs rejection reasons centrally.
- **Metadata & Registry:** A canonical `CoreSkill` schema captures metadata (id, name, version, description, tags, categories, provider source). Skills register into an in-memory registry with stable ordering, metadata-only loads for search, and double mapping (by id plus sorted list) for UI consumption.
- **Search / Index (Phase 2):** Local index supports full-text search, tag and category facets, and deferred full loads. Ranking prioritizes metadata matches, recent updates, and optionally expandable to embeddings later.
- **Tool Layer (Phase 3):** Gateway-native tool registry maps skills to tools and vice versa, validates tool inputs, and exposes runnable definitions without external JSON dependencies.
- **Runtime (Phase 4):** Execution engine loads skill instructions/resources from disk, resolves dependencies, and invokes tools entirely within the gateway process with POST `/v1/tools/execute`.
- **Repo Sources (Phase 5):** Git repositories can be configured as discovery sources; the core orchestrates synchronizing repositories, pulling updates locally, and reindexing their skills.
- **Admin Control Plane (Phase 6):** Dashboard surfaces skill status, tool registry health, provider sync state, rejection logs, and reindex timestamps. Admin actions allow reindexing, repo sync, discovery refresh, cache invalidation, and source toggles.
- **Core Constraints:** No external runtimes, MCP servers, sidecars, or extra storage systems—everything is native TypeScript inside the gateway/Vscode extension context.

## Architecture
The Native Skill Core is a single system living inside `bH`’s API Gateway. Custom providers, discovery, registry, search, runtime, repo sync, tool registry, and dashboard all share the same in-memory state surface and HTTP endpoints. Discovery drives a normalized registry, which feeds search, tools, runtime, and admin metrics. The dashboard queries the same registry/status data, so there is only one canonical state at any time. Every layer is implemented from scratch in TypeScript—no borrowed runtimes or MCP infrastructure.

## Phases
1. **Skill Core (read-only):** Manifest parsing, validation, registry population, and GET `/v1/skills`.
2. **Search / Index:** Build local indices, expose search endpoint, and add ranking logic.
3. **Tool Layer:** Tool registry, validation, and GET `/v1/tools`.
4. **Runtime:** Load instructions/resources, execute tools, POST `/v1/tools/execute`.
5. **Repo Sources:** Manage Git-based skill sources, sync + reindex, POST `/v1/skills/repos/sync`.
6. **Admin / Dashboard:** Extend UI, surface status actions, admin endpoints for reindex/logs/cache.

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

## Dashboard / Admin Requirements
- Surface loaded skill list with metadata (id, name, version, tags).
- Show tool registry coverage and tool count per skill.
- Record provider status (local paths, repo sync state, last discovery).
- Display rejection/parse error log with timestamps and error messages.
- Expose actions: reindex skills, sync repo sources, refresh discovery, invalidate cache, toggle sources on/off.
- Reflect last reindex or sync timestamp for each source and the entire core.

## Tests
- Unit coverage for manifest parsing and validation (valid skill, missing fields, bad YAML, duplicate ids, empty directories, invalid paths).
- Registry coverage (successful registration, rejection logging, defaults).
- API integration tests for `GET /v1/skills` with and without data.
- Configuration tests for default path and custom path.
- Type checking, lint, and full compile run before claiming production readiness.
- Manual admin panel verification once UI changes land.

## Non-Goals
- MCP servers, CLIs, external runtimes, sidecars, or secondary storage layers.
- Copy-paste from reference projects—only concept extraction is allowed.
- Loading every skill into a single giant context upfront.
- Any external dependency that contradicts the “everything native in gateway” rule.

---

# Phase 1 Task Plan

| File | Purpose | Acceptance Criteria | Test Cases |
| --- | --- | --- | --- |
| `src/skills/types.ts` | Define the canonical `CoreSkill` schema, config types for discovery paths, and helpers for required/optional fields. | Schema captures id, name, version, description, tags, categories, source, path, manifest metadata. Config exposes default path `.vscode/skills` plus overrides. | Compile-time checks ensure required fields exist; runtime guard coverage for missing/invalid fields. |
| `src/skills/fs/readSkillManifest.ts` | Read `SKILL.md`, parse YAML frontmatter, validate required fields, normalize casing/order, and return a typed manifest result or rejection reason. | Returns `CoreSkill` metadata for valid files and logs normalized values; rejects and logs invalid manifests without crashing. | Tests for valid manifest, missing `id`, missing `version`, invalid YAML, duplicate ids, and rejection logging. |
| `src/skills/fs/discoverSkills.ts` | Walk the configured discovery path, find skill folders, invoke manifest loader lazily, handle empty dirs, and support refresh/reindex signals. | Discovery yields metadata-only entries and can refresh on demand; invalid folders log and skip without halting. | Tests for empty folder discovery, invalid path, custom discovery path, and refresh triggering re-scan. |
| `src/skills/registry/skillRegistry.ts` | Maintain in-memory registry, accept new `CoreSkill`s, enforce uniqueness, support listings for `GET /v1/skills`, and expose rejection logs. | Registry sorts skills deterministically, rejects duplicates, exposes last refresh timestamp, and allows snapshot of metadata list. | Tests cover registration, duplicate detection, empty results, config default/custom path, and rejection log entries. |

