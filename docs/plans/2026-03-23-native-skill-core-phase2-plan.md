# Native Skill Core Phase 2 Implementation Plan
I'm using the writing-plans skill to create the implementation plan.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the local search/index layer so `/v1/skills/search` can run full-text/tag/category queries over the validated registry.
**Architecture:** A build step consumes the registry snapshot, tokenizes name/description/tags/categories, and stores a lightweight inverted index plus metadata. Search queries run through ranking logic that scores keyword hits, tag matches, and recency, and the API endpoint renders the sorted skill list with metadata.
**Tech Stack:** TypeScript, Node fs/string utilities, in-memory indexes, `node:test` suite for validation.

---

### Task 1: Build the Skill Index
**Files:**
- Create: `src/skills/search/buildSkillIndex.ts`
- Test: `test/skills/search/buildSkillIndex.test.ts`

**Step 1: Write the failing test**
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSkillIndex } from '../../src/skills/search/buildSkillIndex.ts';
const snapshot = {
  skills: [
    { id: 'a', slug: 'a', name: 'Alpha', description: 'Searchable description', tags: ['tag1'], categories: ['cat'] } as any
  ],
  rejections: [],
  lastRefresh: 'now',
  sourcePath: '.'
};

test('buildSkillIndex tokenizes metadata', () => {
  const index = buildSkillIndex(snapshot);
  assert(index.postings.has('alpha'));
});
```

**Step 2: Run test to verify it fails**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/search/buildSkillIndex.test.ts
```

**Step 3: Implement index builder**
- Tokenize `name`, `description`, `tags`, and `categories`, normalize tokens (lowercase, strip punctuation).
- Store inverted index `{ token: Set<skillId> }`, plus metadata map `skillId -> CoreSkill`.
- Export `buildSkillIndex(snapshot)` and helper `createIndex` for reuse.

**Step 4: Run test to verify pass**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/search/buildSkillIndex.test.ts
```

**Step 5: Commit**
```
git add src/skills/search/buildSkillIndex.ts test/skills/search/buildSkillIndex.test.ts
git commit -m "feat: add skill index builder"
```

### Task 2: Search API Logic
**Files:**
- Create: `src/skills/search/searchSkills.ts`
- Test: `test/skills/search/searchSkills.test.ts`

**Step 1: Write the failing test**
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { searchSkills } from '../../src/skills/search/searchSkills.ts';
const index = makeSampleIndex();
test('searchSkills finds keyword matches', () => {
  const result = searchSkills(index, 'alpha');
  assert.equal(result.results[0].id, 'alpha.skill');
});
```

**Step 2: Run failing test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/search/searchSkills.test.ts
```

**Step 3: Implement search handler**
- Accept search string, optional tag/category filters, and the index built earlier.
- Look up tokens in the inverted index, combine matches (union/score), and return `SkillSearchResult` with matches sorted by ranking.

**Step 4: Run test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/search/searchSkills.test.ts
```

**Step 5: Commit**
```
git add src/skills/search/searchSkills.ts test/skills/search/searchSkills.test.ts
git commit -m "feat: implement skill search runner"
```

### Task 3: Ranking Layer
**Files:**
- Create: `src/skills/search/rankSkills.ts`
- Test: `test/skills/search/rankSkills.test.ts`

**Step 1: Write the failing test**
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { rankSkills } from '../../src/skills/search/rankSkills.ts';
const candidates = [
  { id: 'a', metadata: { score: 1 } } as any,
  { id: 'b', metadata: { score: 2 } } as any
];
test('rankSkills sorts by combined score', () => {
  const ranked = rankSkills(candidates);
  assert.equal(ranked[0].id, 'b');
});
```

**Step 2: Run failing test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/search/rankSkills.test.ts
```

**Step 3: Implement ranking**
- Accept search results with metadata (token match counts, recency) and sort by weighted score (keyword matches > tag matches > updatedAt timestamp).
- Export helper to compute normalized score.

**Step 4: Run test to verify pass**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/search/rankSkills.test.ts
```

**Step 5: Commit**
```
git add src/skills/search/rankSkills.ts test/skills/search/rankSkills.test.ts
git commit -m "feat: add skill ranking utilities"
```

### Task 4: Search Endpoint
**Files:**
- Create: `src/skills/api/skillsSearchHandler.ts`
- Modify: `src/CopilotApiGateway.ts`
- Test: `test/api/skillsSearch.test.ts`

**Step 1: Write the failing test**
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { createSkillsSearchHandler } from '../../src/skills/api/skillsSearchHandler.ts';
const handler = createSkillsSearchHandler(() => sampleSnapshot());
test('handler returns search results', async () => {
  const res = createMockResponse();
  await handler(createMockRequest('alpha'), res);
  assert.equal(res.statusCode, 200);
});
```

**Step 2: Run failing test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/api/skillsSearch.test.ts
```

**Step 3: Implement search handler and gateway wiring**
- Handler uses the index/search builder to produce ranked results.
- Add `GET /v1/skills/search` in the gateway to call the handler and parse `q`, `tags`, `categories` query params.

**Step 4: Run test to verify pass**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/api/skillsSearch.test.ts
```

**Step 5: Commit**
```
git add src/skills/api/skillsSearchHandler.ts src/CopilotApiGateway.ts test/api/skillsSearch.test.ts
git commit -m "feat: expose skill search endpoint"
```
