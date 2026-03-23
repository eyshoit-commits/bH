# Phase 1 Skill System - Read-Only Discovery and Registry for VS Code Extension (GET /v1/skills)

## TL;DR
> **Summary**: Implement a read-only skill discovery and registry system for the VS Code extension, exposing discovered skills via a GET /v1/skills endpoint. Skill manifests are stored in markdown with frontmatter in a configurable path (default .vscode/skills/), loaded into an in-memory registry, and surfaced through the existing API gateway.
> **Deliverables**: 
> - src/skills/types.ts (SkillManifest interface)
> - src/skills/fs/readSkillManifest.ts (read manifest from filesystem)
> - src/skills/fs/discoverSkills.ts (scan directory for manifests)
> - src/skills/registry/skillRegistry.ts (in-memory registry)
> - API endpoint GET /v1/skills in CopilotApiGateway.ts
> - Configuration for skills path (githubCopilotApi.skills.path)
> - Test scaffolding plan
> **Effort**: Medium
> **Parallel**: YES - 4 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 7

## Context
### Original Request
Implement Phase 1 skill system as described in user feedback: focus on read-only skill discovery and registry, no editing/enabling/disabling/repo-sync, build foundation for skill manifest handling.

### Interview Summary
User confirmed:
- Storage: configurable path with workspace-local `.vscode/skills/` default
- Format: Markdown with frontmatter
- Required fields: id, name, version, description
- Test strategy: TDD (RED-GREEN-REFACTOR)
- Scope: types.ts, readSkillManifest.ts, discoverSkills.ts, skillRegistry.ts, GET /v1/skills endpoint

### Metis Review (gaps addressed)
Metis identified uncertainties around manifest format, error handling, caching, concurrency, path resolution, security, conflicting IDs, versioning, API semantics, integration, testing, path configuration, and OS specifics. These were addressed in the plan via clarifying questions, risk mitigation, and explicit acceptance criteria.

## Work Objectives
### Core Objective
Establish a read-only skill manifest discovery and registry system that loads skill manifests from the filesystem, normalizes them into a consistent format, stores them in-memory, and exposes them via a GET /v1/skills API endpoint without modifying the manifests or enabling runtime mutations.

### Deliverables
- SkillManifest TypeScript interface (id, name, version, description)
- readSkillManifest function that loads a single manifest from a file path
- discoverSkills function that scans a directory and returns valid manifests
- SkillRegistry class that manages in-memory collection of skills
- GET /v1/skills endpoint returning array of skill manifests
- Configuration setting for skills path with default
- Comprehensive test plan covering happy paths and edge cases

### Definition of Done (verifiable conditions with commands)
- [x] SkillManifest interface defined in src/skills/types.ts with required fields
- [ ] readSkillManifest function loads valid manifest and returns SkillManifest object
- [ ] discoverSkills function scans directory and returns array of SkillManifest objects
- [ ] SkillRegistry provides methods to load skills and retrieve list
- [ ] GET /v1/skills returns 200 with JSON array of skill objects when manifests exist
- [ ] GET /v1/skills returns 200 with empty array when no manifests found
- [ ] Invalid manifests are skipped and logged (do not cause endpoint failure)
- [ ] Configuration path can be overridden via githubCopilotApi.skills.path setting
- [ ] All deliverables have corresponding unit tests that pass

### Must Have
- Read-only discovery (no file modifications)
- In-memory registry (no persistence beyond process lifetime)
- Configurable skills path with sensible default
- Robust error handling for malformed manifests
- Clear API contract for GET /v1/skills
- Testable implementation following TDD principles

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- No editing, enabling, disabling, or repo-sync of skills
- No runtime manifest modification
- No skill execution or tool mapping
- No search, ranking, or caching beyond basic in-memory registry
- No HTTP methods beyond GET for /v1/skills in Phase 1
- No mutation of extension state outside read-only surface

## Verification Strategy
> ZERO HUMAN INTERVENTION — all verification is agent-executed.
- Test decision: TDD (RED-GREEN-REFACTOR) using Vitest/Jest
- QA policy: Every task has agent-executed scenarios
- Evidence: .sisyphus/evidence/task-{N}-{slug}.{ext}

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: [foundation tasks with categories]
- Task 1: Define SkillManifest data model (writing)
- Task 6: Configuration surface for skillsPath (writing)

Wave 2: [dependent tasks with categories]
- Task 2: Define readSkillManifest interface (deep)
- Task 3: Define discoverSkills interface (deep)

Wave 3: [dependent tasks with categories]
- Task 4: Define SkillRegistry interface & lifecycle (deep)
- Task 5: API surface design GET /v1/skills (deep)

Wave 4: [final wave]
- Task 7: Testing scaffolding plan (writing)

### Dependency Matrix (full, all tasks)
| Task ID | Task Name | Depends On |
|---------|-----------|------------|
| 1 | Define SkillManifest data model | None |
| 2 | Define readSkillManifest interface | 1 |
| 3 | Define discoverSkills interface | 1, 2 |
| 4 | Define SkillRegistry interface & lifecycle | 1, 3 |
| 5 | API surface design GET /v1/skills | 4 |
| 6 | Configuration surface for skillsPath | 1 |
| 7 | Testing scaffolding plan | 1,2,3,4,5,6 |

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1: 2 tasks (writing: 2)
- Wave 2: 2 tasks (deep: 2)
- Wave 3: 2 tasks (deep: 2)
- Wave 4: 1 task (writing: 1)

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [x] 1. Finalize SkillManifest schema in documentation

  **What to do**: Write a precise, machine-readable schema for SkillManifest (id, name, version, description, optional fields)
  **Must NOT do**: Include mutable fields or runtime behavior in Phase 1

  **Recommended Agent Profile**:
  - Category: `[writing]` — Reason: documentation/design of data model
  - Skills: [`git-master`, `writing`] — [why needed]
  - Omitted: [`dev-browser`, `playwright`] — [why not needed]

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 2, 3, 4, 5, 6, 7 | Blocked By: None

  **References** (executor has NO interview context — be exhaustive):
  - Pattern: `src/skills/types.ts` — [define interface]
  - API/Type: `src/gateway/model/normalizeModel.ts:NormalizedModel` — [similar model pattern]
  - Test: `src/gateway/model/normalizeModel.test.ts` — [testing patterns]
  - External: `https://json-schema.org/` — [JSON Schema reference]

  **Acceptance Criteria** (agent-executable only):
  - [ ] File src/skills/types.ts exists with exported interface SkillManifest
  - [ ] SkillManifest has required properties: id: string, name: string, version: string, description: string
  - [ ] Interface includes optional fields: source?: 'local' | 'git' | 'bundled' | 'provider', path?: string, etc.

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: [Happy path - valid SkillManifest]
    Tool: interactive_bash
    Steps: 
      - Create temporary file with content: "id: test\nname: Test Skill\nversion: 1.0.0\ndescription: A test skill"
      - Run validation script that checks if object matches SkillManifest interface
    Expected: Validation passes, object has correct properties
    Evidence: .sisyphus/evidence/task-1-skill-manifest-valid.json

  Scenario: [Failure/edge case - missing required field]
    Tool: interactive_bash
    Steps: 
      - Create temporary file missing version field
      - Run validation script
    Expected: Validation fails with clear error about missing version
    Evidence: .sisyphus/evidence/task-1-skill-manifest-missing-version.json
  ```

  **Commit**: YES | Message: `feat(skill): add SkillManifest type documentation` | Files: [src/skills/types.ts]

- [ ] 2. Define readSkillManifest interface (documentation)

  **What to do**: Document function signature, input/output, error semantics
  **Must NOT do**: Implement file system reading logic beyond interface definition

  **Recommended Agent Profile**:
  - Category: `[deep]` — Reason: precise interface design and error semantics
  - Skills: [`git-master`] — [why needed]
  - Omitted: [`dev-browser`, `playwright`] — [why not needed]

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 3 | Blocked By: 1

  **References**:
  - Pattern: `src/skills/fs/readSkillManifest.ts` — [define function]
  - API/Type: `src/skills/types.ts:SkillManifest` — [return type]
  - Test: `src/services/AuditService.ts` — [error handling patterns]
  - External: `https://nodejs.org/api/fs.html#fspromisesreadfilepath-options` — [fs.promises reference]

  **Acceptance Criteria** (agent-executable only):
  - [ ] File src/skills/fs/readSkillManifest.ts exists
  - [ ] Exports function readSkillManifest(filePath: string): Promise<SkillManifest>
  - [ ] Documents error handling for file not found and invalid content

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: [Happy path - read valid manifest]
    Tool: interactive_bash
    Steps:
      - Create manifest file with valid content
      - Import and call readSkillManifest with file path
    Expected: Returns Promise resolving to SkillManifest object
    Evidence: .sisyphus/evidence/task-2-read-success.json

  Scenario: [Failure case - file not found]
    Tool: interactive_bash
    Steps:
      - Call readSkillManifest with non-existent path
    Expected: Returns Promise rejecting with error
    Evidence: .sisyphus/evidence/task-2-read-not-found.json
  ```

  **Commit**: YES | Message: `feat(skill): define readSkillManifest interface` | Files: [src/skills/fs/readSkillManifest.ts]

- [ ] 3. Define discoverSkills interface (documentation)

  **What to do**: Document directory scanning contract, return type, error handling
  **Must NOT do**: Implement recursive scanning or caching beyond interface

  **Recommended Agent Profile**:
  - Category: `[deep]` — Reason: filesystem-discovery logic design
  - Skills: [`git-master`] — [why needed]
  - Omitted: [`dev-browser`, `playwright`] — [why not needed]

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 4 | Blocked By: 1, 2

  **References**:
  - Pattern: `src/skills/fs/discoverSkills.ts` — [define function]
  - API/Type: `src/skills/types.ts:SkillManifest[]` — [return type]
  - Test: `src/gateway/model/mergeModels.ts` — [array processing patterns]
  - External: `https://nodejs.org/api/fs.html#fspromisesreaddirpath-options` — [fs.readdir reference]

  **Acceptance Criteria** (agent-executable only):
  - [ ] File src/skills/fs/discoverSkills.ts exists
  - [ ] Exports function discoverSkills(directoryPath: string): Promise<SkillManifest[]>
  - [ ] Documents handling of empty directories and non-manifest files

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: [Happy path - directory with valid manifests]
    Tool: interactive_bash
    Steps:
      - Create directory with two valid manifest files
      - Import and call discoverSkills with directory path
    Expected: Returns Promise resolving to array of two SkillManifest objects
    Evidence: .sisyphus/evidence/task-3-discover-success.json

  Scenario: [Failure case - directory not found]
    Tool: interactive_bash
    Steps:
      - Call discoverSkills with non-existent directory
    Expected: Returns Promise rejecting with error
    Evidence: .sisyphus/evidence/task-3-discover-not-found.json
  ```

  **Commit**: YES | Message: `feat(skill): define discoverSkills interface` | Files: [src/skills/fs/discoverSkills.ts]

- [ ] 4. Define SkillRegistry interface & lifecycle (documentation)

  **What to do**: Document binding between discovery and registry, startup load policy
  **Must NOT do**: Implement persistence or mutation methods beyond read-only surface

  **Recommended Agent Profile**:
  - Category: `[deep]` — Reason: architectural lifecycle of in-memory registry
  - Skills: [`git-master`] — [why needed]
  - Omitted: [`dev-browser`, `playwright`] — [why not needed]

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 5 | Blocked By: 1, 3

  **References**:
  - Pattern: `src/skills/registry/skillRegistry.ts` — [define class]
  - API/Type: `src/skills/types.ts:SkillManifest` — [stored type]
  - Test: `src/McpService.ts` — [lazy loading and registry patterns]
  - External: `https://www.typescriptlang.org/docs/handbook/classes.html` — [TypeScript classes]

  **Acceptance Criteria** (agent-executable only):
  - [ ] File src/skills/registry/skillRegistry.ts exists
  - [ ] Exports class SkillRegistry with constructor and methods
  - [ ] Provides method loadSkillsFromDirectory(path: string): Promise<void>
  - [ ] Provides method getSkills(): SkillManifest[] (read-only)
  - [ ] Documents startup-load lifecycle and in-memory storage

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: [Happy path - load skills from directory]
    Tool: interactive_bash
    Steps:
      - Create directory with valid manifest files
      - Instantiate SkillRegistry
      - Call loadSkillsFromDirectory with directory path
      - Call getSkills()
    Expected: Returns array of loaded SkillManifest objects
    Evidence: .sisyphus/evidence/task-4-registry-load.json

  Scenario: [Edge case - empty directory]
    Tool: interactive_bash
    Steps:
      - Call loadSkillsFromDirectory on empty directory
      - Call getSkills()
    Expected: Returns empty array
    Evidence: .sisyphus/evidence/task-4-registry-empty.json
  ```

  **Commit**: YES | Message: `feat(skill): define SkillRegistry interface & lifecycle` | Files: [src/skills/registry/skillRegistry.ts]

- [ ] 5. API surface design for GET /v1/skills (documentation)

  **What to do**: Specify endpoint contract, response shape, error cases, and status codes
  **Must NOT do**: Implement endpoint logic beyond specification

  **Recommended Agent Profile**:
  - Category: `[deep]` — Reason: API contract design
  - Skills: [`git-master`] — [why needed]
  - Omitted: [`dev-browser`, `playwright`] — [why not needed]

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 7 | Blocked By: 4

  **References**:
  - Pattern: `src/CopilotApiGateway.ts:handleHttpRequest` — [existing route pattern]
  - API/Type: `src/skills/types.ts:SkillManifest[]` — [response type]
  - Test: `src/CopilotApiGateway.test.ts` — [existing test patterns]
  - External: `https://nodejs.org/api/http.html#httpcreateserverrequest-listener` — [Node.js HTTP]

  **Acceptance Criteria** (agent-executable only):
  - [ ] CopilotApiGateway.ts contains route handler for GET /v1/skills
  - [ ] Handler returns 200 with JSON array of skill objects when manifests exist
  - [ ] Handler returns 200 with empty array when no manifests found
  - [ ] Handler handles errors gracefully (does not crash server)

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: [Happy path - skills available]
    Tool: interactive_bash
    Steps:
      - Mock filesystem with skill manifests
      - Start API gateway
      - Send GET request to /v1/skills
    Expected: Response status 200, body JSON array with skill objects
    Evidence: .sisyphus/evidence/task-5-api-success.json

  Scenario: [Edge case - no skills found]
    Tool: interactive_bash
    Steps:
      - Mock filesystem with no skill manifests
      - Send GET request to /v1/skills
    Expected: Response status 200, body empty JSON array []
    Evidence: .sisyphus/evidence/task-5-api-empty.json

  Scenario: [Failure case - filesystem error]
    Tool: interactive_bash
    Steps:
      - Simulate filesystem error during skill loading
      - Send GET request to /v1/skills
    Expected: Response status 200 with empty array or error handled gracefully
    Evidence: .sisyphus/evidence/task-5-api-error.json
  ```

  **Commit**: YES | Message: `feat(skill): specify GET /v1/skills API surface` | Files: [src/CopilotApiGateway.ts]

- [ ] 6. Configuration surface for skillsPath (documentation)

  **What to do**: Document default path and how to override
  **Must NOT do**: Implement runtime mutation of configuration beyond specification

  **Recommended Agent Profile**:
  - Category: `[writing]` — Reason: configuration contract documentation
  - Skills: [`git-master`] — [why needed]
  - Omitted: [`dev-browser`, `playwright`] — [why not needed]

  **Parallelization**: Can Parallel: YES | Wave 1 | Blocks: 7 | Blocked By: 1

  **References**:
  - Pattern: `src/extension.ts` — [configuration access pattern]
  - API/Type: `string` — [path type]
  - Test: `src/extension.test.ts` — [configuration test patterns]
  - External: `https://code.visualstudio.com/api/references/vscode-api#WorkspaceConfiguration` — [VS Code config]

  **Acceptance Criteria** (agent-executable only):
  - [ ] Configuration setting githubCopilotApi.skills.path documented
  - [ ] Default value resolves to workspace-local .vscode/skills/
  - [ ] Absolute paths are used directly
  - [ ] Relative paths are resolved relative to workspace root

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: [Happy path - default path]
    Tool: interactive_bash
    Steps:
      - Unset githubCopilotApi.skills.path setting
      - Resolve skills path
    Expected: Path resolves to <workspace>/.vscode/skills/
    Evidence: .sisyphus/evidence/task-6-config-default.json

  Scenario: [Override path - relative]
    Tool: interactive_bash
    Steps:
      - Set githubCopilotApi.skills.path to "skills"
      - Resolve skills path
    Expected: Path resolves to <workspace>/skills/
    Evidence: .sisyphus/evidence/task-6-config-relative.json

  Scenario: [Override path - absolute]
    Tool: interactive_bash
    Steps:
      - Set githubCopilotApi.skills.path to "/tmp/skills"
      - Resolve skills path
    Expected: Path resolves to /tmp/skills
    Evidence: .sisyphus/evidence/task-6-config-absolute.json
  ```

  **Commit**: YES | Message: `feat(skill): configuration contract for skillsPath` | Files: [src/extension.ts]

- [ ] 7. Testing scaffolding plan (documentation)

  **What to do**: Produce a test matrix with happy-path and edge cases, including exact data fixtures
  **Must NOT do**: Write actual implementation tests beyond planning

  **Recommended Agent Profile**:
  - Category: `[writing]` — Reason: test strategy and scaffolding plan
  - Skills: [`git-master`] — [why needed]
  - Omitted: [`dev-browser`, `playwright`] — [why not needed]

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks:  None | Blocked By: 1, 2, 3, 4, 5, 6

  **References**:
  - Pattern: `src/**/*.test.ts` — [existing test files]
  - API/Type: `vitest` — [testing framework used in repo]
  - Test: `src/jsonBodyParser.test.ts` — [simple test example]
  - External: `https://vitest.dev/` — [Vitest documentation]

  **Acceptance Criteria** (agent-executable only):
  - [ ] Test plan document created at .sisyphus/plans/phase-1-skill-system-test-plan.md
  - [ ] Includes test cases for each deliverable (types, readSkillManifest, discoverSkills, skillRegistry, API endpoint, configuration)
  - [ ] Each test case has clear input, expected output, and validation command
  - [ ] Test plan covers happy paths and edge cases (missing files, invalid content, empty directories, etc.)

  **QA Scenarios** (MANDATORY — task incomplete without these):
  ```
  Scenario: [Test plan validation]
    Tool: interactive_bash
    Steps:
      - Verify test plan document exists
      - Check that it contains test cases for all 6 deliverables
    Expected: Test plan is complete and actionable
    Evidence: .sisyphus/evidence/task-7-test-plan-valid.json
  ```

  **Commit**: YES | Message: `docs/tests: testing scaffolding plan` | Files: [.sisyphus/plans/phase-1-skill-system-test-plan.md]

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep
