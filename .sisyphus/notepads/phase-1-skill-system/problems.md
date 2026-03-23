- Unresolved questions and known issues:
  - What exactly is the minimal viable manifest schema beyond id, name, version, description?
  - How should errors be surfaced from readSkillManifest and discoverSkills (exceptions, error codes, or empty results)?
  - What is the exact concurrency model for loading manifests into the in-memory registry?
  - Are there OS-specific path considerations that require special handling (Windows vs Unix paths)?
  - How will IDs conflict handling be reported to the API consumer and logged?
  - Is there a need for caching or is a cold load acceptable for Phase 1?
  - What is the precise contract for the GET /v1/skills endpoint (query params, pagination, sorting)?

- Potential risk areas (high): scope creep from additional manifest features or API semantics beyond Phase 1 spec
