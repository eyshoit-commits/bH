import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  discoverSkills,
  getDiscoveryRejections,
  clearDiscoveryRejections
} from '../../../src/skills/fs/discoverSkills.ts';
import type { DiscoverSkillsError } from '../../../src/skills/fs/discoverSkills.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtures = path.join(__dirname, '..', '..', 'fixtures', 'discovery');

test.afterEach(() => {
  clearDiscoveryRejections();
});

test('discoverSkills rejects invalid directories', async () => {
  await assert.rejects(
    () => discoverSkills(path.join(fixtures, 'non-existent')),
    (error) => error instanceof Error && (error as DiscoverSkillsError).code === 'ERR_INVALID_DIRECTORY'
  );
});

test('discoverSkills returns an empty array when no SKILL.md files exist', async () => {
  const skills = await discoverSkills(path.join(fixtures, 'empty'));
  assert.equal(skills.length, 0);
});

test('discoverSkills loads a single skill when a valid SKILL.md exists', async () => {
  const skills = await discoverSkills(path.join(fixtures, 'single'));
  assert.equal(skills.length, 1);
  assert.equal(skills[0].id, 'discovery.single');
});

test('discoverSkills records a rejection for invalid manifests', async () => {
  await discoverSkills(path.join(fixtures, 'invalid'));
  const rejections = getDiscoveryRejections();
  assert(rejections.length > 0);
  assert.equal(rejections[0].manifestPath.endsWith('SKILL.md'), true);
});
