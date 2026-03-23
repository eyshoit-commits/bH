# Native Skill Module Rebrand Plan

## Summary
- Recode and rebrand the proxy/dashboard so integrated MCP skill sources (SkillPort, mcp-skillset, Skillz, etc.) become first-class core functionality, with all configuration, discovery, and branding surfaced through the dashboard and `/v1/models`.
- Centralize the automatic discovery, caching, and merging of OpenAI-compatible provider catalogs so users never have to type model lists manually.
- Update the dashboard UI and text/assets to reflect the new “core skill module” brand and expose feature toggles/status for those providers.

## Key Features
1. **Custom provider discovery**
   - Add `autoDiscoverModels` flag, cache provider catalogs per base URL, and merge discovered IDs with manual overrides.
   - Fetch `/models` from each provider, merge into `/v1/models`, and surface discovery status per provider in the dashboard.

2. **Skill module configuration UI**
   - Extend the dashboard’s custom provider card with the new auto-discovery checkbox, status summary, and new branding copy.
   - Provide scripted toggles (start/refresh) so enabling a preconfigured MCP source immediately refreshes the merged catalog.
   - Keep provider test/fetch actions but display results as part of the core module rather than external tooling.

3. **Branding refresh**
   - Rebrand sidebar/dashboard text, badges, and cards to emphasize the core module’s native status.
   - Add a “skill module status” section describing embedded sources and linking to SkillPort/mcp-skillset/Skillz docs.

4. **Documentation & rollout**
   - Document the new plan, features, and how to configure MCP endpoints in `docs/rebrand-skill-module-plan.md`.
   - Provide upgrade notes describing auto-discovery defaults and where to add NVIDIA NIM or SkillPort endpoints.

## Tests
- Unit tests for auto-discovery caching and merging behavior under cached/fetch failure scenarios.
- Integration test hitting `/v1/models` with mocked MCP provider responses to verify merged catalog includes those models.
- Manual verification: enable a preconfigured MCP provider via dashboard, check `/v1/models`, and confirm UI text reflects the new branding.

## Assumptions
- Provider endpoints expose a `/models` list as described (NVIDIA NIM style).
- “Rebrand” is limited to the dashboard/core module; no external marketing collateral is required.
