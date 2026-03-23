# Phase 1 Skill System - Testing Scaffolding Plan

## Overview
This document outlines the test matrix for Phase 1 of the skill system (read-only discovery). All tests follow TDD principles with Vitest.

## Test Files Location
- Unit tests: `src/skills/**/*.test.ts`
- Fixtures: `test-fixtures/skills/`

## Test Matrix

### 1. SkillManifest Types (Task 1)
**File**: `src/skills/types.test.ts`

| Scenario | Input | Expected | Validation |
|----------|-------|----------|------------|
| Valid manifest with required fields | `{ id: "test", name: "Test", version: "1.0.0", description: "Test skill" }` | Object matches SkillManifest | `expect(valid).toMatchSchema()` |
| Missing required field (id) | `{ name: "Test", version: "1.0.0", description: "Test" }` | TypeScript compile error | Build fails |
| Missing required field (name) | `{ id: "test", version: "1.0.0", description: "Test" }` | TypeScript compile error | Build fails |
| Missing required field (version) | `{ id: "test", name: "Test", description: "Test" }` | TypeScript compile error | Build fails |
| Missing required field (description) | `{ id: "test", name: "Test", version: "1.0.0" }` | TypeScript compile error | Build fails |
| Optional fields present | `{ id, name, version, description, source: "local", path: "/path" }` | Optional fields included | `expect(skill.source).toBe("local")` |

### 2. readSkillManifest (Task 2)
**File**: `src/skills/fs/readSkillManifest.test.ts`

| Scenario | Input | Expected | Validation |
|----------|-------|----------|------------|
| Valid manifest file | Valid `.md` with frontmatter | `SkillManifest` object | `toEqual()` |
| File not found | Non-existent path | `ERR_FILE_NOT_FOUND` | `toThrow()` |
| Invalid frontmatter | `.md` without `---` | `ERR_PARSE_FRONTMATTER` | `toThrow()` |
| Missing required field in frontmatter | Frontmatter missing `id` | `ERR_INVALID_MANIFEST` | `toThrow()` |
| Empty file | Empty `.md` file | `ERR_PARSE_FRONTMATTER` | `toThrow()` |

**Fixtures**: `test-fixtures/skills/valid-manifest.md`, `test-fixtures/skills/missing-id.md`

### 3. discoverSkills (Task 3)
**File**: `src/skills/fs/discoverSkills.test.ts`

| Scenario | Input | Expected | Validation |
|----------|-------|----------|------------|
| Directory with valid manifests | Dir with 2 `.md` files | Array of 2 `SkillManifest` | `toHaveLength(2)` |
| Empty directory | Empty dir | Empty array | `toHaveLength(0)` |
| Directory not found | Non-existent path | `ERR_INVALID_DIRECTORY` | `toThrow()` |
| Non-.md files ignored | Dir with `.txt`, `.json` | Empty array | `toHaveLength(0)` |
| Invalid manifest skipped | Dir with 1 valid, 1 invalid | Array with 1 valid | `toHaveLength(1)` |

**Fixtures**: `test-fixtures/skills/discover/empty/`, `test-fixtures/skills/discover/mixed/`

### 4. SkillRegistry (Task 4)
**File**: `src/skills/registry.test.ts`

| Scenario | Input | Expected | Validation |
|----------|-------|----------|------------|
| Load from directory | `loadSkillsFromDirectory(path)` | Registry populated | `isLoaded() === true` |
| Get skills after load | `getSkills()` | Array of skills | `toEqual([...])` |
| Empty directory | Load empty dir | Empty array | `toHaveLength(0)` |
| Get skills before load | `getSkills()` | Empty array | `toHaveLength(0)` |
| Returns shallow copy | Modify returned array | Original unchanged | `toEqual(original)` |

### 5. GET /v1/skills API Endpoint (Task 5)
**File**: `src/skills/api.test.ts` (integration-style unit test)

| Scenario | Input | Expected | Validation |
|----------|-------|----------|------------|
| Skills available | Mock registry with skills | 200, `{ object: "list", data: [...] }` | HTTP response |
| No skills | Empty registry | 200, `{ object: "list", data: [] }` | HTTP response |
| Registry error | Simulate error | 200 with empty data (graceful) | HTTP response |

### 6. Configuration - skills.path (Task 6)
**File**: `src/skills/config.test.ts`

| Scenario | Input | Expected | Validation |
|----------|-------|----------|------------|
| Default path | No config set | Resolves to `.vscode/skills` | Path check |
| Relative path | Config: `skills` | Resolves to `<workspace>/skills` | Path check |
| Absolute path | Config: `/tmp/skills` | Resolves to `/tmp/skills` | Path check |

## Running Tests

```bash
# Run all skill tests
npm test -- --grep "skills"

# Run specific test file
npm test -- src/skills/fs/readSkillManifest.test.ts

# Run with coverage
npm test -- --coverage
```

## Evidence Files
Each QA scenario should produce evidence in `.sisyphus/evidence/`:
- `task-2-read-success.json` - Valid read result
- `task-2-read-not-found.json` - Not found error
- `task-3-discover-success.json` - Discovery success
- `task-3-discover-not-found.json` - Directory error
- `task-4-registry-load.json` - Registry load result
- `task-4-registry-empty.json` - Empty registry case
- `task-5-api-success.json` - API with skills
- `task-5-api-empty.json` - API with no skills
- `task-6-config-default.json` - Default config path
- `task-6-config-override.json` - Overridden config path
