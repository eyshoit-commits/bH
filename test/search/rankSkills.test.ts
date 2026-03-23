import assert from 'node:assert/strict';
import test from 'node:test';

import { rankSkills } from '../../src/skills/search/rankSkills.ts';
import type { RankCandidate } from '../../src/skills/search/rankSkills.ts';

const base: RankCandidate = {
  id: 'base',
  tokenHits: 1,
  tagMatches: 0,
  categoryMatches: 0,
  updatedAt: '2025-01-01T00:00:00Z',
};

test('rankSkills prefers tag matches even with equal token hits', () => {
  const candidates: RankCandidate[] = [
    base,
    { ...base, id: 'tag-boost', tagMatches: 1 },
  ];
  const ranked = rankSkills(candidates);
  assert.strictEqual(ranked[0].id, 'tag-boost');
});

test('rankSkills uses updatedAt as tie breaker and keeps order deterministic', () => {
  const candidates: RankCandidate[] = [
    { ...base, id: 'recent', updatedAt: '2025-02-01T00:00:00Z' },
    { ...base, id: 'older', updatedAt: '2025-01-01T00:00:00Z' },
  ];
  const ranked = rankSkills(candidates);
  assert.strictEqual(ranked[0].id, 'recent');
  assert.strictEqual(ranked[1].id, 'older');
});
