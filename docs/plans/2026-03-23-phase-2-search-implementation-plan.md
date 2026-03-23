# Phase 2 Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an in-memory skill search index, scoring layer, and HTTP endpoint so metadata-only skill discovery can be queried via `GET /v1/skills/search`.

**Architecture:** Registry snapshots feed a search service that builds an inverted index, ranks on metadata/tag relevance with `updatedAt` as a tiebreaker, and exposes results through the gateway routing layer. The search service also exposes deterministic query APIs so statistics can be surfaced in later admin dashboards.

**Tech Stack:** TypeScript + Node.js, VS Code extension HTTP server (`CopilotApiGateway`), builtin test runner (`npm test`), existing TypeScript lint/type pipeline.

---

### Task 1: Build the search index snapshot

**Files:**
- Create: `src/skills/search/buildSkillIndex.ts`
- Test: `test/search/buildSkillIndex.test.ts`

**Step 1: Write the failing test**
```ts
import { buildSkillIndex } from '../../src/skills/search/buildSkillIndex';
import { CoreSkill } from '../../src/skills/types';

it('creates tokens for titles and tags', () => {
  const skill: CoreSkill = { … }; // minimal valid assert
  const snapshot = buildSkillIndex([skill]);
  expect(snapshot.tokens.get('example')).toContain(skill.id);
});
```

**Step 2: Run the test to verify it fails**
Run: `npm test -- test/search/buildSkillIndex.test.ts --runInBand`
Expected: FAIL because `buildSkillIndex` does not exist yet or does not produce tokens.

**Step 3: Implement the minimum code**
- Normalize strings (lowercase, strip punctuation).
- Build inverted `Map<string, Set<string>>` for tokens covering `name`, `description`, `tags`, `categories`.
- Store facet maps for `tags`, `categories`, `source`.
- Emit `SkillIndexSnapshot` type with `tokens`, `facets`, `metadata`.
- Provide helpers to rebuild deterministically from `CoreSkill[]`.

**Step 4: Run the test**
Run: `npm test -- test/search/buildSkillIndex.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**
```bash
git add src/skills/search/buildSkillIndex.ts test/search/buildSkillIndex.test.ts
git commit -m "feat: add skill index builder"
```

### Task 2: Implement ranking logic

**Files:**
- Create: `src/skills/search/rankSkills.ts`
- Test: `test/search/rankSkills.test.ts`

**Step 1: Write the failing test**
```ts
import { rankSkills } from '../../src/skills/search/rankSkills';

it('prefers tag matches and uses updatedAt tie breaker', () => {
  const ranked = rankSkills([{ id: 'a', tags: ['core'], score: 1, updatedAt: new Date('2025-01-01') }, …]);
  expect(ranked[0].id).toBe('a');
});
```

**Step 2: Run test**
`npm test -- test/search/rankSkills.test.ts --runInBand`
Expected: FAIL (rankSkills missing).

**Step 3: Implement**
- Accept list of match candidates (id, tokenHits, tagMatches, categoryMatches, updatedAt).
- Score: `tokenHits * TOKEN_WEIGHT + tagMatches * TAG_WEIGHT + categoryMatches * CATEGORY_WEIGHT`.
- Sort by score desc, then `updatedAt` desc, then `id`.
- Export `RankedSkill` for debugging.

**Step 4: Run tests**
`npm test -- test/search/rankSkills.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**
```bash
git add src/skills/search/rankSkills.ts test/search/rankSkills.test.ts
git commit -m "feat: add search ranking"
```

### Task 3: Implement search query handling

**Files:**
- Create: `src/skills/search/searchSkills.ts`
- Test: `test/search/searchSkills.test.ts`

**Step 1: Write failing test**
```ts
import { searchSkills } from '../../src/skills/search/searchSkills';
import { SkillIndexSnapshot } from '../../src/skills/search/buildSkillIndex';

it('filters by query and paginates', async () => {
  const snapshot: SkillIndexSnapshot = { … };
  const result = await searchSkills({ q: 'foo', tags: [], limit: 2, offset: 0 }, snapshot);
  expect(result.skills).toHaveLength(2);
});
```

**Step 2: Run test**
`npm test -- test/search/searchSkills.test.ts --runInBand`
Expected: FAIL.

**Step 3: Implement**
- Parse params (`q`, `tags`, `categories`, `source`, `limit`, `offset`).
- Query snapshot token/facet maps, merge skill IDs, compute `RankedSkill` objects via `rankSkills`, enforce pagination.
- Return `{ skills: CoreSkillPreview[], total, tookMs, debug?: … }`.
- Throw `new ApiError(400, …, 'invalid_param')` for invalid limits/offsets.

**Step 4: Run test**
`npm test -- test/search/searchSkills.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**
```bash
git add src/skills/search/searchSkills.ts test/search/searchSkills.test.ts
git commit -m "feat: add skill search handler"
```

### Task 4: Wire the gateway endpoint

**Files:**
- Modify: `src/CopilotApiGateway.ts:…` (endpoint registration near other `/v1` routes)
- Test: `test/api/skills-search.test.ts`

**Step 1: Write failing integration test**
```ts
it('returns search results', async () => {
  const res = await request(server).get('/v1/skills/search?q=example');
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.skills)).toBe(true);
});
```

**Step 2: Run test**
`npm test -- test/api/skills-search.test.ts --runInBand`
Expected: FAIL (endpoint missing).

**Step 3: Implement**
- Parse query params from Express-like request object.
- Call new search service (or direct `searchSkills`) with snapshot from registry.
- Respond with `{ skills, total, tookMs }`.
- Catch validation errors and convert to `ApiError`.

**Step 4: Run tests**
`npm test -- test/api/skills-search.test.ts --runInBand`
Expected: PASS.

**Step 5: Commit**
```bash
git add src/CopilotApiGateway.ts test/api/skills-search.test.ts
git commit -m "feat: add skills search endpoint"
```

### Task 5: Optional search service aggregator

**Files:**
- Create: `src/skills/search/index.ts`
- Modify: registry to call `searchService.refresh(...)` after discovery (if necessary)

**Step 1: Write failing test**
```ts
it('exposes refresh and search helpers', () => {
  const service = new SkillSearchService();
  expect(service.search({ q: '' })).toEqual({ skills: [], total: 0 });
});
```

**Step 2: Run test**
- `npm test -- test/search/index.test.ts --runInBand` (exaggerated)

**Step 3: Implement**
- Maintain latest `SkillIndexSnapshot`.
- Offer `refresh(coreSkills)` and `search(params)` wrappers that delegate to steps above.
- Hook registry refresh hook to call `service.refresh(...)`.

**Step 4: Run tests**
- `npm test -- test/search/index.test.ts --runInBand`

**Step 5: Commit**
- `git add src/skills/search/index.ts`
- `git commit -m "feat: add search service"`

---

Plan complete and saved to `docs/plans/2026-03-23-phase-2-search-implementation-plan.md`. Two execution options:

1. **Subagent-Driven (this session)** – I dispatch fresh subagent per task with reviews between tasks.
2. **Parallel Session (separate)** – Open a new session using `superpowers:executing-plans` for batched execution.

Which approach?
