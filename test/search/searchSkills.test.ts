import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSkillIndex } from '../../src/skills/search/buildSkillIndex.ts';
import { searchSkills, SearchError } from '../../src/skills/search/searchSkills.ts';
import type { CoreSkill } from '../../src/skills/types.ts';

const sampleSkill: CoreSkill = {
  id: 'hello-world',
  slug: 'hello-world',
  name: 'Hello World Skill',
  version: '1.0.0',
  description: 'A friendly greeting.',
  tags: ['greeting'],
  categories: ['utility'],
  source: 'local',
  path: '/tmp/hello/SKILL.md',
  enabled: true,
  updatedAt: '2026-01-01T00:00:00Z',
};

const anotherSkill: CoreSkill = {
  ...sampleSkill,
  id: 'farewell',
  name: 'Farewell Skill',
  tags: ['farewell'],
  categories: ['utility'],
  updatedAt: '2026-02-01T00:00:00Z',
  slug: 'farewell',
  path: '/tmp/farewell/SKILL.md',
};

test('searchSkills matches query tokens and limits results', () => {
  const snapshot = buildSkillIndex([sampleSkill, anotherSkill]);
  const result = searchSkills({ query: 'hello', limit: 1 }, snapshot);
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.skills.length, 1);
  assert.strictEqual(result.skills[0].id, 'hello-world');
});

test('searchSkills filters by tag and source', () => {
  const snapshot = buildSkillIndex([sampleSkill, anotherSkill]);
  const result = searchSkills({ tags: ['farewell'], source: 'local' }, snapshot);
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.skills[0].id, 'farewell');
});

test('searchSkills returns empty result for empty snapshot', () => {
  const snapshot = buildSkillIndex([]);
  const result = searchSkills({ query: 'anything' }, snapshot);
  assert.strictEqual(result.total, 0);
  assert.deepStrictEqual(result.skills, []);
});

test('searchSkills rejects invalid pagination values', () => {
  const snapshot = buildSkillIndex([sampleSkill]);
  assert.throws(() => searchSkills({ limit: 0 }, snapshot), SearchError);
  assert.throws(() => searchSkills({ offset: -1 }, snapshot), SearchError);
});
