Issues & blockers for GET /v1/skills surface design
- Define exact SkillManifest type in types.ts (fields and optional fields).
- Confirm whether id is namespaced and unique across registry and how to present it in the API.
- Decide on optional query params (limit, includeDeprecated, filter by tag) and their validation.
- Cache semantics: determine ETag/Last-Modified generation strategy and invalidation rules.
- Decide on authentication/authorization: is this public or restricted in certain environments?
- Establish error envelope standard: { error: { code, message } }, and codes mapping to 400/500.
- Determine pagination approach if limit is used (offset/limit or cursor).
