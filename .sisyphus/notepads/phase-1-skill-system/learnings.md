Phase 1 Gap Analysis – Skill System (read-only discovery)

- Critical gaps identified (need concrete implementations):
  - 2) Define readSkillManifest interface (signature and error semantics)
  - 3) Define discoverSkills(directory) -> SkillManifest[] interface
  - 4) Define SkillRegistry interface & lifecycle (load + get)
  - 5) API surface design for GET /v1/skills (contract, response, errors)
  - 6) Configuration surface for skills.path (docs and resolution rules)
  - 7) Testing scaffolding plan (test matrix, fixtures, evidence)

- Ambiguities and risk areas (high impact if unresolved):
  - Manifest format details, error handling strategy, and OS path resolution
  - Caching, concurrency, and security considerations for a read-only registry
  - ID/version conflicts across manifests and how to surface errors
  - API semantics: status codes, empty vs. error, and pagination (if any)

- Proposed mitigation approach:
  - Define interfaces first (done in plan) and implement small, testable units
  - Write unit tests in tandem with implementation (TDD guidance from plan)
  - Keep Phase 1 strictly read-only; avoid mutations or repo-sync in this phase
  - Introduce a lightweight, in-memory registry with deterministic behavior

- Next steps to execute in upcoming waves:
  - Implement readSkillManifest.ts and discoverSkills.ts with unit tests
  - Implement SkillRegistry.ts wired to load from directory and expose getSkills()
  - Draft and validate GET /v1/skills API contract in CopilotApiGateway.ts
  - Document githubCopilotApi.skills.path configuration and default path
  - Produce a comprehensive test plan (phase-1-skill-system-test-plan.md)

- Evidence tracking: align with .sisyphus/plans/phase-1-skill-system.md tasks and acceptance criteria
