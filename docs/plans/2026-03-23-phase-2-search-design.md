# Phase 2 — Native Skill Search Design

## Context
- Phase 1 established a read-only skill registry: discovery from `SKILL.md`, canonical `CoreSkill` objects, rejection logs, and `GET /v1/skills` support. The registry already exposes metadata-only snapshots that can feed search.
- Phase 2 extends this foundation with a dedicated search index and API. All work stays inside the core gateway (no MCP/sidecar) and continues to reuse the same VS Code extension UI surface for any admin tooling added later.

## Objectives
1. Build an in-memory search index that covers skill titles, descriptions, tags, categories, and provider/source metadata without eagerly reloading the entire skill bundle.
2. Expose `GET /v1/skills/search` with query, tag, and category filters plus pagination hints.
3. Rank results by metadata relevance (keyword match + tag/category alignment) and use `updatedAt` as a tie-breaker so fresher skills bubble up.
4. Keep the search layer testable and deterministic so the later dashboard components can surface consistent data.

## Component Breakdown

### `src/skills/search/buildSkillIndex.ts`
- Purpose: Convert a snapshot of `CoreSkill`s from the registry into an index optimized for prefix/keyword matching. The builder tokenizes titles, descriptions, tags, and categories into normalized tokens, creates inverted index tables, and tracks metadata references per token. It also stores the `updatedAt` timestamp and per-skill facet data (ref categories/tags) for ranking.
- Key behaviors: incremental rebuilds from registry refreshes, config-driven tokenization (lowercasing, punctuation stripping), and a typed surface that exposes `SkillIndexSnapshot` for consumers.

### `src/skills/search/searchSkills.ts`
- Purpose: Accept search requests, apply filters (`query`, `tags`, `categories`, `source`), and return ordered `CoreSkill` metadata with scoring details. It queries the `SkillIndexSnapshot`, merges matches from tokens and facets, and ensures pagination parameters (`limit`, `offset`) are honored.
- Key behaviors: metadata-only loading (no tool/runtime payload), gracefully handles empty queries (returning either all skills or an empty list depending on config), and respects registry rejection logs so invalid skills never surface.

### `src/skills/search/rankSkills.ts`
- Purpose: Score and sort matched skills before they reach the HTTP layer. The ranker assigns points for token hits, exact tag/category matches, and includes `updatedAt` as a deterministic tiebreaker (newer `updatedAt` wins). The score signature makes it easy to surface contributing factors in the admin logs later.
- Key behaviors: stable sorting, explicit tie-handling, optional thresholds for minimum score, and the ability to plug in additional signals (e.g., future embedding distances) without reworking consumers.

## Data Flow
1. Discovery populates the registry (`skillRegistry`), emitting `CoreSkill` snapshots on refresh.
2. Phase 2 introduces a `SkillIndexService` (internal helper in the search folder) that listens for registry refreshes or reindex commands and rebuilds the inverted index via `buildSkillIndex.ts`.
3. Search requests hit `searchSkills.ts`, which consults the latest `SkillIndexSnapshot`, filters by query/tag/category, ranks via `rankSkills.ts`, and formats the response.
4. The HTTP endpoint always pulls metadata from the registry or index snapshot; actual runtime instructions/tools remain untouched until Phase 3/4.

## API Contract
- `GET /v1/skills/search`
  - Query params: `q` (string), `tags` (comma-separated), `categories` (comma-separated), `source` (local|repo|bundled), `limit` (number, default 25), `offset` (number, default 0)
  - Response: `{ skills: CoreSkillPreview[], total: number, tookMs: number, debug?: ScoreBreakdown[] }`
- `CoreSkillPreview` mirrors the registry metadata (id, name, version, description, tags, categories, source, updatedAt) without loading runtime assets.
- Search errors (e.g., invalid pagination) surface as structured `ApiError` responses with status 400.

## Error Handling & Observability
- Invalid tokens or empty registry state return `{ skills: [], total: 0 }` with `tookMs` for instrumentation; no exception is thrown.
- Index builds wrap errors with rejection logging so the admin UI later receives the same details recorded during Phase 1 (reject logging continues to be the source of truth).
- Logging includes query strings, filter values, matched skill IDs, and the final sort order for easier debugging when the UI reuses this data.

## Testing Strategy
- Unit tests for `buildSkillIndex` to validate tokenization, inverted index populations, and facet tracking.
- Unit tests for `searchSkills` covering queries with/without filters, pagination/offset, missing index snapshots, and invalid params.
- Unit tests for `rankSkills` ensuring deterministic ordering for ties based on `updatedAt` and ensuring tag/category matches bump scores appropriately.
- Integration tests for `GET /v1/skills/search` with mocked registry snapshots, verifying status 200 with data, 200 with empty results, and 400 on malformed params.
- Benchmarks (optional) for index rebuild durations once Phase 3 adds heavy loads.

## Acceptance Criteria
1. Search endpoint returns metadata-only `CoreSkill` previews and honors query/filter parameters.
2. Ranking logic is stable, scoring is logged (or easily debuggable), and `updatedAt` is applied as a deterministic tiebreaker.
3. All new search code is covered by unit tests and the integration tests described above.
4. The existing `GET /v1/skills` endpoint continues to work unchanged and still surfaces rejection logs.

## Next Steps (Post-Design)
1. Pending user approval, create the Phase 2 task plan via `writing-plans` and spawn implementation tasks tied to TypeScript files + API wiring.
2. After Phase 2 merges, iterate on Tool Layer planning (Phase 3) with the same approach and reuse the admin UI surface introduced earlier for status cards.
