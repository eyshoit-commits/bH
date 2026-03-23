import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadSkillsFromDirectory, getSkillSnapshot } from '../../src/skills/registry.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtures = path.join(__dirname, '..', 'fixtures', 'registry', 'multi');

test('GET /v1/skills should mirror registry snapshot', async () => {
  await loadSkillsFromDirectory(fixtures);
  const snapshot = getSkillSnapshot();
  assert.equal(snapshot.skills.length, 2);
  assert(snapshot.lastRefresh !== null);
  assert.equal(snapshot.rejections.length, 0);
});
