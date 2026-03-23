Design learnings for GET /v1/skills surface
- Goal: Define a precise surface contract that surfaces SkillManifest-like objects from SkillRegistry.getSkills(), without modifying runtime logic.
- Data contract should align with existing types.ts definitions (SkillManifest-like shape) and API gateway routing style used by CopilotApiGateway.ts.
- Cache strategy: expose ETag/Last-Modified so clients can cache and validators can short-circuit.
- Error handling: standard envelope with HTTP status mapping (200, 400, 500).
- Provide example curl and sample response payloads to anchor implementation.
- Ensure the surface remains read-only and stable; no changes to runtime data flow beyond documentation.

Assumptions:
- The SkillManifest shape includes: id, name, version, description and optional fields (author, homepage, tags, lastUpdated, deprecated).
- Endpoint pulls fresh data from SkillRegistry.getSkills() on each request, optionally capped by limit param.
