# Phase 3 Tool Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Introduce a gateway-native tool registry, skill-level tool mapping, input schema validation, and expose the catalog through `GET /v1/tools`.

**Architecture:** A `ToolRegistry` service maintains canonical `CoreTool` metadata; `registerSkillTools` normalizes skill-declared definitions; `validateToolInput` enforces schema constraints; the gateway route queries the registry snapshot. All modules reuse TypeScript types and the existing discovery feedback loop.

**Tech Stack:** TypeScript Node (VS Code extension context), Node test runner (`node --test`), existing registry infrastructure, HTTP handlers inside `CopilotApiGateway`.

---

### Task 1: Implement the tool registry core

**Files:**
- Create: `src/tools/toolRegistry.ts`
- Test: `test/tools/toolRegistry.test.ts`

**Step 1: Write failing test**
```ts
import { ToolRegistry } from '../../src/tools/toolRegistry.ts';

test('registers and lists tools', () => {
  const registry = new ToolRegistry();
  expect(() => registry.register({ id: 'skill:foo', skillId: 'skill', name: 'Foo', toolType: 'knowledge', enabled: true, updatedAt: new Date().toISOString() })).not.toThrow();
});
```

**Step 2: Run test**
`node --test test/tools/toolRegistry.test.ts`
Expected: FAIL because registry not implemented.

**Step 3: Implement code**
- Manage `CoreTool` map plus `toolBySkill` index.
- Enforce unique ids, update `updatedAt`, expose `list()` and `getForSkill(skillId)`.
- Export `CoreTool`, `CoreToolPreview`.

**Step 4: Run test**
`node --test test/tools/toolRegistry.test.ts`
Expected: PASS.

**Step 5: Commit**
`git add src/tools/toolRegistry.ts test/tools/toolRegistry.test.ts`
`git commit -m "feat: add tool registry"`

### Task 2: Hook skill manifests into the tool registry

**Files:**
- Create: `src/tools/registerSkillTools.ts`
- Test: `test/tools/registerSkillTools.test.ts`

**Step 1: Write failing test**
```ts
import { registerSkillTools } from '../../src/tools/registerSkillTools.ts';
import { ToolRegistry } from '../../src/tools/toolRegistry.ts';

test('registers tools defined per skill', () => { ... });
```

**Step 2: Run test**
`node --test test/tools/registerSkillTools.test.ts`
Expected: FAIL.

**Step 3: Implement**
- Read `tools` block from skill manifest (passed as argument), normalize to `CoreTool` (id derived from `${skillId}:${toolSlug}`).
- Use `validateToolInput` to ensure schema before registration.
- Return `[CoreToolPreview]` for the skill.

**Step 4: Run test**
`node --test test/tools/registerSkillTools.test.ts`
Expected: PASS.

**Step 5: Commit**
`git add src/tools/registerSkillTools.ts test/tools/registerSkillTools.test.ts`
`git commit -m "feat: register skill tools"`

### Task 3: Provide tool input validation helpers

**Files:**
- Create: `src/tools/validateToolInput.ts`
- Test: `test/tools/validateToolInput.test.ts`

**Step 1: Write failing test**
```ts
import { validateToolInput } from '../../src/tools/validateToolInput.ts';

test('rejects missing required properties', () => { ... });
```

**Step 2: Run**
`node --test test/tools/validateToolInput.test.ts`

**Step 3: Implement**
- Export `validateToolDefinition` (checks presence/type of `name`, `description`, `toolType`, optional `inputSchema`, `tags`). Use lightweight schema rules.
- Throw descriptive errors for invalid definitions.

**Step 4: Run**
`node --test test/tools/validateToolInput.test.ts`

**Step 5: Commit**
`git add src/tools/validateToolInput.ts test/tools/validateToolInput.test.ts`
`git commit -m "feat: validate tool input"`

### Task 4: Expose GET /v1/tools

**Files:**
- Modify: `src/CopilotApiGateway.ts` (new route near `/v1/skills/search`)
- Test: `test/api/tools.test.ts`

**Step 1: Write failing test**
```ts
import request from 'supertest'; // or existing HTTP harness
test('GET /v1/tools returns cached catalog', async () => { ... });
```

**Step 2: Run**
`node --test test/api/tools.test.ts`
Expected: FAIL until route exists.

**Step 3: Implement**
- Import `ToolRegistry` or search service, build snapshot from registry.
- Support optional filters (`skillId`, `toolType`).
- Return `{ object: 'list', data, total }`.
- Handle errors with `ApiError`.

**Step 4: Run test**
`node --test test/api/tools.test.ts`

**Step 5: Commit**
`git add src/CopilotApiGateway.ts test/api/tools.test.ts`
`git commit -m "feat: expose tools endpoint"`

---

Plan complete and saved to `docs/plans/2026-03-23-phase-3-tool-layer-implementation-plan.md`. Two execution options:

1. **Subagent-Driven (this session)** – fresh subagent per task with reviews between tasks.
2. **Parallel Session (separate)** – open a new session using `superpowers:executing-plans`.

Which approach?
