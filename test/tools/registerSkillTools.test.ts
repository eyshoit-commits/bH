import assert from 'node:assert/strict';
import test from 'node:test';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

import { ToolRegistry } from '../../src/tools/toolRegistry';
import { registerSkillTools } from '../../src/tools/registerSkillTools';
import type { CoreSkill } from '../../src/skills/types';

test('registerSkillTools loads definitions from tools.json', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'skill-tools-'));
  await fs.writeFile(
    path.join(dir, 'tools.json'),
    JSON.stringify([
      {
        name: 'Hello',
        description: 'Says hello',
        toolType: 'knowledge',
        tags: ['greeting']
      }
    ]),
    'utf-8'
  );

  const registry = new ToolRegistry();
  const skill: CoreSkill = {
    id: 'skill.hello',
    slug: 'skill-hello',
    name: 'Skill Hello',
    version: '1.0.0',
    description: 'Test skill',
    tags: [],
    categories: [],
    source: 'local',
    path: path.join(dir, 'SKILL.md'),
    enabled: true,
    updatedAt: new Date().toISOString(),
    tools: [],
    modelHints: [],
    capabilityTags: []
  };

  const result = await registerSkillTools(skill, registry);
  assert.strictEqual(result.registered.length, 1);
  const list = registry.list();
  assert.strictEqual(list.length, 1);
});

test('registerSkillTools records rejections for invalid JSON', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'skill-tools-invalid-'));
  await fs.writeFile(path.join(dir, 'tools.json'), '{invalid', 'utf-8');

  const registry = new ToolRegistry();
  const skill: CoreSkill = {
    id: 'skill.invalid',
    slug: 'skill-invalid',
    name: 'Skill Invalid',
    version: '1.0.0',
    description: 'Test skill',
    tags: [],
    categories: [],
    source: 'local',
    path: path.join(dir, 'SKILL.md'),
    enabled: true,
    updatedAt: new Date().toISOString(),
    tools: [],
    modelHints: [],
    capabilityTags: []
  };

  const result = await registerSkillTools(skill, registry);
  assert.strictEqual(result.registered.length, 0);
  assert.ok(result.rejections.length > 0);
});
