# Phase 4 Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the local skill runtime (instruction loading, resource resolution, tool invocation) and expose `POST /v1/tools/execute`.

**Architecture:** Runtime modules load instructions/resources during discovery, expose helpers that resolve assets, and invoke tools using the normalized `CoreTool` definitions. The gateway POST handler validates inputs and dispatches to the runtime, returning structured results or `ApiError`s.

**Tech Stack:** TypeScript in VS Code extension runtime, promise-based filesystem APIs, existing `ToolRegistry`, simple in-memory logging structure, `node --test` harness for unit/integration checks.

---

### Task 1: Load skill instructions

**Files:**
- Create: `src/skills/runtime/loadSkillInstructions.ts`
- Test: `test/skills/runtime/loadSkillInstructions.test.ts`

**Step 1: Write failing test**
```ts
import { loadSkillInstructions } from '../../../src/skills/runtime/loadSkillInstructions.ts';
```

**Step 2: Run**
`node --test test/skills/runtime/loadSkillInstructions.test.ts`

**Step 3: Implement**
- Read `instructions.json`/`instruction.md`, normalize metadata (`type`, `tools`, `resources`), validate required fields, return typed structure.
- Throw descriptive errors for missing/invalid steps.

**Step 4: Run**
`node --test test/skills/runtime/loadSkillInstructions.test.ts`

**Step 5: Commit**
`git add src/skills/runtime/loadSkillInstructions.ts test/skills/runtime/loadSkillInstructions.test.ts`
`git commit -m "feat: load skill instructions"`

### Task 2: Resolve skill resources

**Files:**
- Create: `src/skills/runtime/resolveSkillResources.ts`
- Test: `test/skills/runtime/resolveSkillResources.test.ts`

**Step 1: Write failing test**
```ts
import { resolveSkillResources } from '../../../src/skills/runtime/resolveSkillResources.ts';
```

**Step 2: Run**
`node --test test/skills/runtime/resolveSkillResources.test.ts`

**Step 3: Implement**
- Accept skill path + instructions referencing files (scripts/templates).
- Ensure each referenced file exists under the skill folder, return absolute paths, throw if missing.

**Step 4: Run**
`node --test test/skills/runtime/resolveSkillResources.test.ts`

**Step 5: Commit**
`git add src/skills/runtime/resolveSkillResources.ts test/skills/runtime/resolveSkillResources.test.ts`
`git commit -m "feat: resolve skill resources"`

### Task 3: Implement tool invocation executor

**Files:**
- Create: `src/skills/runtime/invokeSkillTool.ts`
- Test: `test/skills/runtime/invokeSkillTool.test.ts`

**Step 1: Write failing test**
```ts
import { invokeSkillTool } from '../../../src/skills/runtime/invokeSkillTool.ts';
```

**Step 2: Run**
`node --test test/skills/runtime/invokeSkillTool.test.ts`

**Step 3: Implement**
- Validate tool exists, inputs match expected schema (reuse `validateToolDefinition`).
- Access instructions/resources to load the prompt or script.
- Simulate execution (mock drivers in tests) and return `{ result, logs, tool_id, tookMs }`.
- Throw `ToolExecutionError` with metadata on failure.

**Step 4: Run**
`node --test test/skills/runtime/invokeSkillTool.test.ts`

**Step 5: Commit**
`git add src/skills/runtime/invokeSkillTool.ts test/skills/runtime/invokeSkillTool.test.ts`
`git commit -m "feat: invoke skill tool"`

### Task 4: Wire `POST /v1/tools/execute`

**Files:**
- Modify: `src/CopilotApiGateway.ts`
- Test: `test/api/tools-execute.test.ts`

**Step 1: Write failing test**
```ts
import request from 'supertest';
```

**Step 2: Run**
`node --test test/api/tools-execute.test.ts`

**Step 3: Implement**
- Parse `tool_id` + `input` from body, call `invokeSkillTool`, handle `ToolExecutionError`/`ApiError`, respond with structured payload (`object: 'tool_execution'`).
- Log execution duration for admin telemetry.

**Step 4: Run**
`node --test test/api/tools-execute.test.ts`

**Step 5: Commit**
`git add src/CopilotApiGateway.ts test/api/tools-execute.test.ts`
`git commit -m "feat: add tools execution endpoint"`

---

Plan complete and saved to `docs/plans/2026-03-23-phase-4-runtime-implementation-plan.md`. Execution options:

1. **Subagent-Driven (this session)** – continue with per-task subagents and regular updates.
2. **Parallel Session (separate)** – start a new session using `superpowers:executing-plans`.

Which approach?
