Phase 1 Gap Log – Issues and blockers

- Blocking gaps (critical):
  - Read SkillManifest interface and its error semantics not implemented yet
  - discoverSkills contract and return type not implemented
  - In-memory SkillRegistry lifecycle not implemented
  - GET /v1/skills API surface not specified in code yet
  - githubCopilotApi.skills.path configuration not implemented

- Ambiguities (high risk):
  - Manifest format nuances (optional fields, validation rules)
  - Concurrency and caching strategy for repeated loads
  - Cross-platform path handling and normalization
  - Handling of conflicting IDs/versions across manifests

- Plan to address blockers (high-level):
  - Create signatures and skeleton implementations first (read-only)
  - Write focused unit tests for each unit before integration
  - Keep a strict scope envelope: no mutation or repo-sync in Phase 1
  - Document decisions and trade-offs in decisions.md

- Immediate blockers requiring decision: None requiring external input yet; proceed with interface-first implementation per plan
