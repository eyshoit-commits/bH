import assert from 'node:assert/strict';
import test from 'node:test';

import { buildSkillIndex } from '../../src/skills/search/buildSkillIndex.ts';
import type { CoreSkill } from '../../src/skills/types.ts';

const skill: CoreSkill = {
  id: 'hello-world',
  slug: 'hello-world',
  name: 'Hello World Skill',
  version: '1.0.0',
  description: 'A skill that says hello.',
  tags: ['greeting'],
  categories: ['utility'],
  source: 'local',
  path: '/tmp/skills/hello-world/SKILL.md',
  enabled: true,
  updatedAt: '2025-01-01T00:00:00Z',
};

test('buildSkillIndex indexes name and tags as tokens', () => {
  const snapshot = buildSkillIndex([skill]);
  assert(snapshot.tokens['hello']?.includes(skill.id), 'title token must include skill id');
  assert(snapshot.tokens['world']?.includes(skill.id), 'title token must include skill id');
  assert(snapshot.tags['greeting']?.includes(skill.id), 'tag index must include skill id');
  assert(snapshot.categories['utility']?.includes(skill.id), 'category index must include skill id');
});

test('buildSkillIndex normalizes tokens and deduplicates sources', () => {
  const another: CoreSkill = {
    ...skill,
    id: 'another',
    name: 'Hello, world!',
    tags: ['Greeting'],
    updatedAt: '2025-02-01T00:00:00Z',
  };

  const snapshot = buildSkillIndex([skill, another]);
  assert(snapshot.tokens['hello']?.length === 2, 'shared token should reference both skills');
  assert(snapshot.tags['greeting']?.length === 2, 'tag normalization is case-insensitive');
  assert(snapshot.sources.local.length === 2, 'source map tracks each skill id once');
});
