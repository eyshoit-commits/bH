import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readSkillManifest } from '../../../src/skills/fs/readSkillManifest.ts';
import type { ReadSkillManifestError } from '../../../src/skills/fs/readSkillManifest.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtures = path.join(__dirname, '..', '..', 'fixtures', 'skills-manifests');

test('readSkillManifest returns normalized CoreSkill for a valid manifest', async () => {
  const manifest = await readSkillManifest(path.join(fixtures, 'valid.md'));
  assert.equal(manifest.id, 'test.skill');
  assert.equal(manifest.name, 'Test Skill');
  assert.deepEqual(manifest.tags, ['fast', 'local']);
  assert.deepEqual(manifest.categories, ['utils']);
  assert.equal(manifest.repoUrl, 'https://example.com/repo');
});

test('readSkillManifest rejects manifests missing required fields', async () => {
  await assert.rejects(() => readSkillManifest(path.join(fixtures, 'missing-id.md')), (error) => {
    return error instanceof Error && (error as ReadSkillManifestError).code === 'ERR_INVALID_MANIFEST';
  });
  await assert.rejects(() => readSkillManifest(path.join(fixtures, 'missing-version.md')), (error) => {
    return error instanceof Error && (error as ReadSkillManifestError).code === 'ERR_INVALID_MANIFEST';
  });
});

test('readSkillManifest rejects invalid frontmatter', () => {
  return assert.rejects(() => readSkillManifest(path.join(fixtures, 'invalid.md')), (error) => {
    return error instanceof Error && (error as ReadSkillManifestError).code === 'ERR_PARSE_FRONTMATTER';
  });
});
