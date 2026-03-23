# Skill Index Builder Implementation Plan

I'm using the writing-plans skill to create the implementation plan.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the deterministic `SkillIndexSnapshot` that tokenizes `CoreSkill` metadata and exposes testable search-ready structures.

**Architecture:** Normalize each skill's title, description, tags, and categories into a reusable token set, then assemble inverted indexes plus facet maps and metadata lookups so downstream search can consume consistent snapshots.

**Tech Stack:** TypeScript (ESM), node:test + node:assert, npm scripts (`npm test`).

---

### Task 1: Skill index builder

**Files:**
- Create: `src/skills/search/buildSkillIndex.ts`
- Test: `test/search/buildSkillIndex.test.ts`

**Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSkillIndex } from '../../src/skills/search/buildSkillIndex';
import { CoreSkill } from '../../src/skills/types';

test('buildSkillIndex indexes promise tokens', () => {
  const skill: CoreSkill = {
    id: 'foo',
    slug: 'foo',
    name: 'Foo Bar',
    version: '1.0.0',
    description: 'Example description.',
    tags: ['example'],
    categories: ['core'],
    source: 'local',
    path: '/tmp/foo',
    enabled: true,
    updatedAt: '2026-03-23T00:00:00Z'
  };

  const snapshot = buildSkillIndex([skill]);
  assert.ok(snapshot.tokens.get('foo')?.has(skill.id));
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- test/search/buildSkillIndex.test.ts --runInBand`
Expected: FAIL because `buildSkillIndex` is missing or produces no tokens yet.

**Step 3: Implement the minimal code**

- Create `SkillIndexSnapshot` export that contains:
  - `tokens: Map<string, Set<string>>`
  - `facets: { tags: Map<string, Set<string>>, categories: Map<string, Set<string>>, source: Map<string, Set<string>> }`
  - `metadata: Map<string, CoreSkill>`
- Normalize strings (lowercase, trim, strip punctuation) and deduplicate tokens across `name`, `description`, `tags`, `categories`.
- Build inverted maps deterministically by iterating sorted `CoreSkill[]` input and pushing each token/facet entry.
- Ensure missing tags/categories default to empty arrays so facet maps stay predictable.

**Step 4: Run the test again**

Run: `npm test -- test/search/buildSkillIndex.test.ts --runInBand`
Expected: PASS once the index is built correctly.

**Step 5: Commit**

```bash
git add src/skills/search/buildSkillIndex.ts test/search/buildSkillIndex.test.ts
git commit -m "feat: add skill index builder"
```

Plan complete and saved to `docs/plans/2026-03-23-skill-index-builder-plan.md`. Two execution options:

1. **Subagent-Driven (this session)** — stay here, run Task 1 via subagent-driven-development, spec reviewer, and code-quality reviewer inflight.
2. **Parallel Session (separate)** — move to a new session under executing-plans for batched checkpoints.

Which approach?
