import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SkillRegistry } from '../../../src/skills/registry/skillRegistry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtures = path.join(__dirname, '..', '..', 'fixtures', 'registry');

test('SkillRegistry loads multiple distinct skills', async () => {
  const registry = new SkillRegistry();
  await registry.loadFromDirectory(path.join(fixtures, 'multi'));
  const skills = registry.getSkills();
  assert.equal(skills.length, 2);
  assert.equal(skills[0].id, 'registry.skill.a');
  assert.equal(registry.getRejections().length, 0);
  const snapshot = registry.getSnapshot();
  assert.equal(snapshot.sourcePath.endsWith('multi'), true);
  assert(snapshot.lastRefresh !== null);
});

test('SkillRegistry records duplicate skill ids as rejections', async () => {
  const registry = new SkillRegistry();
  await registry.loadFromDirectory(path.join(fixtures, 'duplicate'));
  const rejections = registry.getRejections();
  assert(rejections.length > 0);
  assert.equal(rejections[0].skillId, 'registry.duplicate');
  const skills = registry.getSkills();
  assert.equal(skills.length, 1);
});
