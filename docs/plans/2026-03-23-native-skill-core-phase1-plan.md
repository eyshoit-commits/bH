# Native Skill Core Phase 1 Implementation Plan
I'm using the writing-plans skill to create the implementation plan.

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the Phase 1 read-only Native Skill Core surface: typed manifests, configurable discovery, deterministic registry, and `GET /v1/skills` on the existing gateway.
**Architecture:** Discovery reads `SKILL.md` YAML, normalizes metadata to a `CoreSkill` shape, and feeds an in-memory skill registry that is surfaced by a dedicated API handler; VS Code configuration determines the scan path.
**Tech Stack:** TypeScript (Node 20+), Node fs APIs, VS Code configuration API, existing HTTP server in `CopilotApiGateway`, Node built-in `node:test`.

---

### Task 1: CoreSkill Schema, Validation Helpers, Config Defaults
**Files:**
- Modify: `src/skills/types.ts`
- Create: `src/skills/config.ts`
- Test: `test/skills/types.test.ts`, `test/skills/config.test.ts`

**Step 1: Write the failing test**
```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCoreSkill, CoreSkill } from '../../src/skills/types';
import { resolveSkillPath } from '../../src/skills/config';

describe('CoreSkill schema', () => {
  it('exposes a runtime guard & normalizer before implementation', () => {
    const manifest = { id: 'foo', name: 'Foo', version: '1.0.0', description: 'desc' } as any;
    const normalized = normalizeCoreSkill(manifest);
    assert.equal(normalized.id, 'foo');
  });
});

describe('Skills config defaults', () => {
  it('returns the default path before config implementation', () => {
    assert.equal(resolveSkillPath(), '.vscode/skills');
  });
});
```

**Step 2: Run test to verify it fails**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/types.test.ts
```
Expected: FAIL because `normalizeCoreSkill` / `resolveSkillPath` are not yet implemented.

**Step 3: Write minimal implementation**
```ts
export interface CoreSkill {
  id: string;
  slug: string;
  name: string;
  version: string;
  description: string;
  tags: string[];
  categories: string[];
  source: 'local';
  path: string;
  enabled: boolean;
  updatedAt: string;
}

const DEFAULT_SKILL_PATH = '.vscode/skills';

export function normalizeCoreSkill(raw: Partial<CoreSkill>): CoreSkill {
  return {
    id: String(raw.id),
    slug: String(raw.slug ?? raw.id ?? '').replace(/\s+/g, '-').toLowerCase(),
    name: String(raw.name ?? 'Unnamed Skill'),
    version: String(raw.version ?? '0.0.0'),
    description: String(raw.description ?? ''),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    categories: Array.isArray(raw.categories) ? raw.categories : [],
    source: raw.source ?? 'local',
    path: String(raw.path ?? ''),
    enabled: raw.enabled ?? true,
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

// src/skills/config.ts
import * as vscode from 'vscode';

export function resolveSkillPath(): string {
  const configuration = vscode.workspace.getConfiguration('githubCopilotApi');
  return configuration.get<string>('skills.path', DEFAULT_SKILL_PATH);
}
```

**Step 4: Run test to verify it passes**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/types.test.ts
```
Expected: PASS once helpers exist and default path is returned.

**Step 5: Commit**
```
git add src/skills/types.ts src/skills/config.ts test/skills/types.test.ts test/skills/config.test.ts
git commit -m "feat: add core skill schema and config helpers"
```

### Task 2: Robust Manifest Reader
**Files:**
- Modify: `src/skills/fs/readSkillManifest.ts`
- Test: `test/skills/fs/readSkillManifest.test.ts`

**Step 1: Write the failing test**
```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readSkillManifest } from '../../../src/skills/fs/readSkillManifest';

describe('readSkillManifest', () => {
  it('throws when YAML is missing required keys', async () => {
    await assert.rejects(() => readSkillManifest('test/fixtures/invalid-missing-id.md'));
  });
});
```

**Step 2: Run failing test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/fs/readSkillManifest.test.ts
```
Expected: FAIL because file & parser not implemented yet.

**Step 3: Implement reader**
```ts
import { readFile } from 'fs/promises';
import path from 'path';
import { normalizeCoreSkill, CoreSkill } from '../types';

const REQUIRED = ['id', 'name', 'version', 'description'];

export async function readSkillManifest(filePath: string): Promise<CoreSkill> {
  const raw = await readFile(filePath, 'utf-8');
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) throw new Error('Missing frontmatter');

  const values = match[1].split('\n').reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split(':');
    if (!key || !rest.length) return acc;
    acc[key.trim()] = rest.join(':').trim();
    return acc;
  }, {});

  for (const field of REQUIRED) {
    if (!values[field]) throw new Error(`Missing ${field}`);
  }

  return normalizeCoreSkill({
    ...values,
    path: filePath,
  });
}
```

**Step 4: Run test to verify pass**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/fs/readSkillManifest.test.ts
```

**Step 5: Commit**
```
git add src/skills/fs/readSkillManifest.ts test/skills/fs/readSkillManifest.test.ts
git commit -m "feat: tighten skill manifest parsing"
```

### Task 3: Discovery Service with Configurable Path
**Files:**
- Modify: `src/skills/fs/discoverSkills.ts`
- Test: `test/skills/fs/discoverSkills.test.ts`

**Step 1: Write the failing test**
```ts
import { describe, it } from 'node:test';
import { discoverSkills } from '../../../src/skills/fs/discoverSkills';

describe('discoverSkills', () => {
  it('rejects invalid directories', async () => {
    await assert.rejects(() => discoverSkills('non/existent'));
  });
});
```

**Step 2: Run failing test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/fs/discoverSkills.test.ts
```

**Step 3: Implement discovery**
```ts
import { readdir, stat } from 'fs/promises';
import path from 'path';
import { resolveSkillPath } from '../config';
import { readSkillManifest } from './readSkillManifest';

interface RejectionEntry {
  manifestPath: string;
  reason: string;
}

const rejectionLog: RejectionEntry[] = [];

export async function discoverSkills(directoryPath?: string): Promise<CoreSkill[]> {
  const target = directoryPath ?? resolveSkillPath();
  const entries = await readdir(target);
  const skills: CoreSkill[] = [];
  for (const entry of entries) {
    if (!entry.endsWith('.md')) continue;
    const manifestPath = path.join(target, entry);
    try {
      const skill = await readSkillManifest(manifestPath);
      const statInfo = await stat(manifestPath);
      skills.push({
        ...skill,
        updatedAt: statInfo.mtime.toISOString(),
        source: 'local',
      });
    } catch (error) {
      rejectionLog.push({ manifestPath, reason: String(error) });
    }
  }
  return skills;
}
```

**Step 4: Run test to verify pass**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/fs/discoverSkills.test.ts
```

**Step 5: Commit**
```
git add src/skills/fs/discoverSkills.ts test/skills/fs/discoverSkills.test.ts
git commit -m "feat: configurable skill discovery"
```

### Task 4: Registry Surface & Snapshot API
**Files:**
- Create: `src/skills/registry/skillRegistry.ts`
- Modify: `src/skills/registry.ts` (if needed to re-export)
- Test: `test/skills/registry/skillRegistry.test.ts`

**Step 1: Write the failing test**
```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SkillRegistry } from '../../src/skills/registry/skillRegistry';

const baseSkill = {
  id: 'duplicate.skill',
  slug: 'duplicate-skill',
  name: 'Duplicate Skill',
  version: '1.0.0',
  description: 'test',
  tags: [],
  categories: [],
  source: 'local' as const,
  path: '.vscode/skills/duplicate.md',
  enabled: true,
  updatedAt: new Date().toISOString(),
};

describe('SkillRegistry', () => {
  it('rejects duplicate ids', () => {
    const registry = new SkillRegistry();
    registry.loadFromDiscovered([baseSkill, { ...baseSkill, slug: 'duplicate-again' }]);
    assert.ok(registry.getRejections().some((r) => r.id === 'duplicate.skill'));
  });
});
```

**Step 2: Run failing test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/registry/skillRegistry.test.ts
```

**Step 3: Implement registry**
```ts
import { CoreSkill } from '../types';

export interface SkillRegistrySnapshot {
  skills: CoreSkill[];
  lastRefresh: string | null;
}

export class SkillRegistry {
  private skills: Map<string, CoreSkill> = new Map();
  private rejectionLog: { id: string; reason: string }[] = [];
  private lastRefresh: string | null = null;

  loadFromDiscovered(discovered: CoreSkill[]): void {
    this.rejectionLog = [];
    this.skills.clear();
    for (const skill of discovered) {
      if (this.skills.has(skill.id)) {
        this.rejectionLog.push({ id: skill.id, reason: 'duplicate id' });
        continue;
      }
      this.skills.set(skill.id, skill);
    }
    this.lastRefresh = new Date().toISOString();
  }

  getSkills(): CoreSkill[] {
    return [...this.skills.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  getSnapshot(): SkillRegistrySnapshot {
    return {
      skills: this.getSkills(),
      lastRefresh: this.lastRefresh,
    };
  }

  getRejections() {
    return [...this.rejectionLog];
  }
}
```

Add helper `initSkillRegistry()` that calls `discoverSkills(resolveSkillPath())` and loads the registry.

**Step 4: Run test to verify pass**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/skills/registry/skillRegistry.test.ts
```

**Step 5: Commit**
```
git add src/skills/registry/skillRegistry.ts src/skills/registry.ts test/skills/registry/skillRegistry.test.ts
git commit -m "feat: add skill registry with rejection logging"
```

### Task 5: GET /v1/skills Endpoint
**Files:**
- Create: `src/skills/api/skillsHandler.ts`
- Modify: `src/CopilotApiGateway.ts`
- Test: `test/api/skills.test.ts`

**Step 1: Write the failing test**
```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createSkillsHandler } from '../../src/skills/api/skillsHandler';
import { SkillRegistrySnapshot } from '../../src/skills/registry/skillRegistry';

describe('skills API handler', () => {
  it('responds with registry snapshot', async () => {
    const snapshot: SkillRegistrySnapshot = { skills: [], metadata: {} };
    const handler = createSkillsHandler(() => snapshot);
    const ctx = await handler({ method: 'GET', url: '/v1/skills' } as any);
    assert.equal(ctx.status, 200);
  });
});
```

**Step 2: Run failing test**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/api/skills.test.ts
```

**Step 3: Implement handler & wiring**
```ts
import type { IncomingMessage, ServerResponse } from 'http';
import type { SkillRegistrySnapshot } from '../registry/skillRegistry';

export function createSkillsHandler(getSnapshot: () => SkillRegistrySnapshot) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const snapshot = getSnapshot();
    const payload = JSON.stringify(snapshot);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    });
    res.end(payload);
  };
}
```

In `CopilotApiGateway.ts`, after parsing `/v1/*` routes, add a branch:
```ts
if (req.method === 'GET' && req.url === '/v1/skills') {
  return skillsHandler(req, res);
}
```

**Step 4: Run test to verify pass**
```
NODE_OPTIONS=--experimental-vm-modules node --test test/api/skills.test.ts
```

**Step 5: Commit**
```
git add src/skills/api/skillsHandler.ts src/CopilotApiGateway.ts test/api/skills.test.ts
git commit -m "feat: expose GET /v1/skills from registry"
```
