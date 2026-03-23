Decision log for GET /v1/skills surface
- Modeled after existing CopilotApiGateway.ts patterns and SkillRegistry.getSkills() ingestion.
- Data shape: introduce SkillManifest interface with required fields: id, name, version, description; optional: author, homepage, tags, lastUpdated, deprecated.
- Endpoint: GET /v1/skills returns SkillManifest[] with HTTP 200 on success.
- Optional query: limit (int, cap results); includeDeprecated (bool) can be added later; pagination supported if needed.
- Caching: expose ETag and Last-Modified headers; use 304 when If-None-Match matches.
- Error handling: standard envelope with codes and messages; map to 400 for bad input and 500 for server errors.
- Security: surface is read-only; default to public; adjust if internal/private mode is required.
- No changes to runtime data flow beyond surface documentation; do not modify CopilotApiGateway.ts or SkillRegistry in this task.
