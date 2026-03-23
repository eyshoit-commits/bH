# Native Skill Core Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a self-contained native skill core inside `CopilotApiGateway` that catalogues `.vscode/skills` manifests and exposes them through `/v1/skills`.

**Architecture:** Read skill definitions from the workspace skill directory, parse the YAML frontmatter from `SKILL.md`, normalize valid manifests into a `CoreSkill` structure, and cache them in an in-memory registry that the gateway can query directly without MCP or external services.

**Tech Stack:** TypeScript, Node.js filesystem APIs, YAML frontmatter parsing, internal Express/Koa-style HTTP routing inside `CopilotApiGateway`.

---

### Task 1: Skill discovery core

**Files:**
- Create: `src/skills/types.ts`
- Create: `src/skills/fs/readSkillManifest.ts`
- Create: `src/skills/fs/discoverSkills.ts`
- Create: `src/skills/registry/skillRegistry.ts`
- Modify: `src/CopilotApiGateway.ts` (routing + initialization)
- Test: `tests/skills/discovery.test.ts`

**Step 1: Write the failing test**

```ts
import { discoverSkills } from '../../src/skills/fs/discoverSkills.js';

test('discoverSkills rejects invalid manifests and returns normalized CoreSkill list', () => {
  const skills = await discoverSkills('/tmp/skills');
  expect(skills).toEqual([
    { id: 'valid.skill', name: 'Valid Skill', version: '1.0.0', description: 'desc', category: 'misc', tags: [], path: expect.any(String) }
  ]);
});
```

**Step 2: Run test to verify it fails**
Run: `bun test tests/skills/discovery.test.ts`
Expected: FAIL because `discoverSkills` and `CoreSkill` do not yet exist.

**Step 3: Write minimal implementation**
Implement the types, `readSkillManifest`, `discoverSkills`, and registry as described below:

- `CoreSkill` has `id, name, version, description, category?, tags?, path, manifestRaw`.
- `readSkillManifest(path)` reads `SKILL.md`, parses YAML frontmatter, validates required fields `id,name,version,description`.
- `discoverSkills` walks `.vscode/skills`, uses `readSkillManifest`, and returns normalized `CoreSkill[]`; log rejected manifests.
- `skillRegistry` exposes `register(skills: CoreSkill[])`, `list()`, and `refresh()`.

Update `CopilotApiGateway` to instantiate registry on startup and expose helper `getSkills()`.

**Step 4: Run test to verify it passes**
Run: `bun test tests/skills/discovery.test.ts`
Expected: PASS after implementation.

**Step 5: Commit**

```bash
git add src/skills/types.ts src/skills/fs/readSkillManifest.ts src/skills/fs/discoverSkills.ts src/skills/registry/skillRegistry.ts src/CopilotApiGateway.ts tests/skills/discovery.test.ts
git commit -m "feat: add native skill discovery core"
```

### Task 2: Skill listing endpoint

**Files:**
- Modify: `src/CopilotApiGateway.ts:#L1900-2000` (HTTP handler)
- Create: `tests/api/skills.test.ts`

**Step 1: Write the failing test**

```ts
test('GET /v1/skills returns CoreSkill list', async () => {
  const res = await gateway.inject({ method: 'GET', path: '/v1/skills' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({ object: 'list', data: expect.arrayContaining([{ id: 'valid.skill' }]) });
});
```

**Step 2: Run test to verify it fails**
Run: `bun test tests/api/skills.test.ts`
Expected: FAIL because endpoint missing.

**Step 3: Write minimal implementation**
Add handler in gateway to return `{ object: 'list', data: registry.list() }`.

**Step 4: Run test to verify it passes**
Run: `bun test tests/api/skills.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/CopilotApiGateway.ts tests/api/skills.test.ts
git commit -m "feat: expose /v1/skills endpoint"
```

### Task 3: Monitoring and reload hooks

**Files:**
- Modify: `src/skills/registry/skillRegistry.ts`
- Modify: `src/CopilotApiGateway.ts`
- Test: `tests/skills/registry.test.ts`

**Step 1: Write the failing test**

```ts
test('refresh replaces registry contents when directory changes', () => {
  await registry.register([{ ... }]);
  await registry.refresh();
  expect(registry.list()).not.toEqual(initial);
});
```

**Step 2: Run test to verify it fails**
Run: `bun test tests/skills/registry.test.ts`
Expected: FAIL due to missing refresh logic.

**Step 3: Write minimal implementation**
Add `.refresh()` which reruns `discoverSkills` and re-registers; `CopilotApiGateway` calls it on `/v1/skills/reindex`.

**Step 4: Run test to verify it passes**
Run: `bun test tests/skills/registry.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/skills/registry/skillRegistry.ts src/CopilotApiGateway.ts tests/skills/registry.test.ts
git commit -m "chore: add skill registry refresh"
```

### Task 4: Lightweight validations

**Files:**
- Modify: `src/skills/fs/readSkillManifest.ts`
- Modify: `tests/skills/validation.test.ts`

**Step 1: Write failing tests**

```
test('rejects skill without id', () => { ... expect error ... });
test('rejects skill with invalid YAML', () => { ... });
```

**Step 2: Run them (bun test tests/skills/validation.test.ts) -> FAIL**

**Step 3: Implement validation in `readSkillManifest`**, logging rejects and throwing descriptive errors consumed by discovery.

**Step 4: Run tests again -> PASS**

**Step 5: Commit**

### Task 5: Integration and docs

**Files:**
- Modify: `docs/features.md`
- Modify: `README.md`
- Modify: `docs/tasks/merged-feature-plan.md`

**Step 1: Update docs describing new skill core and `/v1/skills`.**
**Step 2: Add tests verifying docs references.**
**Step 3: Run `bun test` to ensure no doc-only failure.**
**Step 4: Commit with summary referencing plan.**

### Task 6: Admin control-plane APIs

**Files:**
- Modify: `src/CopilotApiGateway.ts`
- Modify: `src/CopilotApiGateway.ts:#L1700-2100` (new admin endpoint block)
- Create: `tests/api/admin-status.test.ts`
- Create: `tests/api/admin-actions.test.ts`

**Step 1: Write the failing tests**

```ts
test('GET /v1/admin/skills/status returns counts and timestamps', async () => {
  const res = await gateway.inject({ method: 'GET', path: '/v1/admin/skills/status' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({
    object: 'status',
    skills_loaded: expect.any(Number),
    last_refresh: expect.any(String),
    rejected: expect.any(Array)
  });
});

test('POST /v1/admin/skills/reindex triggers refresh and returns summary', async () => {
  const res = await gateway.inject({ method: 'POST', path: '/v1/admin/skills/reindex' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({ object: 'action', action: 'reindex', success: true });
});
```

**Step 2: Run tests to verify they fail**
Run: `bun test tests/api/admin-status.test.ts tests/api/admin-actions.test.ts`
Expected: FAIL because endpoints do not exist yet.

**Step 3: Implement minimal handlers**
- Add new `/v1/admin/skills/status`, `/v1/admin/providers/status`, `/v1/admin/logs/skills`, `/v1/admin/cache/invalidate`, `/v1/admin/skills/reindex`, `/v1/admin/skills/repos/sync`, `/v1/admin/providers/refresh` handlers inside `CopilotApiGateway`.
- Reuse the skill registry for counts, log caching to surface rejected manifests, and integrate with provider status metadata (provider list, enabled flag, last probe time).
- Reuse existing custom provider manager to return statuses and allow enable/disable via POST endpoints.
- Return deterministic JSON payloads that include counts (skills, tools, providers), last refresh timestamps, rejected skill reasons, and action summaries.

**Step 4: Run tests to verify passes**
Run: `bun test tests/api/admin-status.test.ts tests/api/admin-actions.test.ts`
Expected: PASS once handlers return the expected payloads.

**Step 5: Commit**

```bash
git add src/CopilotApiGateway.ts tests/api/admin-status.test.ts tests/api/admin-actions.test.ts
git commit -m "feat: add admin control plane endpoints"
```

### Task 7: Admin dashboard integration

**Files:**
- Modify: `src/CopilotPanel.ts` (UI template and message handlers)
- Modify: `website/docs.html`/`website/index.html` if mirrored data is needed
- Modify: `src/CopilotPanel.ts:#L2100-3200` (new cards)
- Test: Manual visual inspection and `bun test` for any TS logic extracted into helpers

**Step 1: Sketch UI updates**
- Add `SkillCoreCard`, `ProviderStatusCard`, `ToolRegistryCard`, `SystemDebugPanel`, `AdminActionsBar` sections inside the dashboard template.
- Each card should show counts, last refresh times, list of recent rejections, provider status badges, and action buttons.

**Step 2: Wire backend messages**
- Extend the webview <-> extension communication so the panel can request admin data from `/v1/admin/*` endpoints.
- Display skill metadata (CoreSkill list), rejection logs, provider health, and caching info.

**Step 3: Add controls**
- Add buttons/forms for Reindex, Repo Sync, Provider Refresh, Cache invalidate, discovery refresh.
- Show inline responses (success/failure) and log information after each action.

**Step 4: Manual confirmation**
- Open the dashboard in VS Code, verify the new cards render with mock data, and buttons fire API requests that reach the gateway.

**Step 5: Commit**

```bash
git add src/CopilotPanel.ts website/index.html
git commit -m "feat: build admin control plane dashboard"
```
