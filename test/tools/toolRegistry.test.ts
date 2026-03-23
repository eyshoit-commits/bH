import assert from 'node:assert/strict';
import test from 'node:test';
import { ToolRegistry, ToolRegistryError } from '../../src/tools/toolRegistry';
import type { CoreTool } from '../../src/tools/toolRegistry';

test('ToolRegistry registers and lists tools', () => {
  const registry = new ToolRegistry();
  const tool: CoreTool = {
    id: 'skill:hello',
    skillId: 'skill',
    name: 'Hello',
    description: 'Greets',
    toolType: 'knowledge',
    tags: ['greeting'],
    enabled: true,
    updatedAt: new Date().toISOString()
  };

  registry.register(tool);
  const list = registry.list();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, tool.id);
});

test('ToolRegistry rejects duplicate tool ids', () => {
  const registry = new ToolRegistry();
  const tool: CoreTool = {
    id: 'skill:dup',
    skillId: 'skill',
    name: 'Dup',
    description: 'Duplicate',
    toolType: 'script',
    tags: [],
    enabled: true,
    updatedAt: new Date().toISOString()
  };

  registry.register(tool);
  assert.throws(() => {
    registry.register(tool);
  }, ToolRegistryError);
});
