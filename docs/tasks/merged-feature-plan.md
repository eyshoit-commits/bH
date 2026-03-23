# Native Core Skill Module — Feature Merge Tasks

## Objective
List every existing feature/topic from the original GitHub Copilot API Gateway (README + docs) that must be preserved/rebranded as part of the new native core skill module, explain why it stays, and turn the merge into a concrete task set under `docs/tasks`.

## Feature Inventory (to keep/rebrand)
1. **OpenAPI-compatible API surface** (`/v1/chat/completions`, `/v1/responses`, `/v1/models`, `/v1/tools`, Google/Anthropic shims) — keeps compatibility with agents, LangChain, Cursor, etc.; must stay so the new module can expose MCP skills via the same endpoints.
2. **Auto-discovered multi-provider catalog** (VS Code models + custom providers) — core capability so any skill endpoint appears without manual API changes; now the “skill module” will merge SkillPort/mcp-skillset/Skillz catalogs into this flow.
3. **Cloudflare tunnel + auth controls** — necessary for remote access; retains same settings but with brand language in the new dashboard.
4. **Quick Start + CLI usage guidance** for integrations like Cursor, LangChain, Clawdbot — document once in the rebrand docs rather than removing.
5. **Custom provider settings** (add/test/fetch/remove) — now reinterpreted as the “skill module sources” UI, but controls stay embedded in dashboard.
6. **MCP status & tools cards** — the new core module must show embedded MCP skill sources and their tool lists inside the dashboard, merging the old MCP section.

## Task Plan (docs/tasks)
1. **Detail feature merge rationale** (`docs/tasks/merged-feature-plan.md`): explain each feature slot above, why it must survive, and map it to the new core module surface.
2. **Design settings/tasks doc** (`docs/tasks/skill-module-config.md`): show how SkillPort/mcp-skillset/Skillz endpoints become configurable sources, auto-discovery flow, and which dashboard controls map to each legacy feature.
3. **Implementation sequencing doc** (`docs/tasks/skill-module-implementation.md`):
   - Step 1: Extend `CustomProviderConfig` + caching/extraction (already started) and describe how `/v1/models` merges VS Code + MCP catalogs.
   - Step 2: Update dashboard UI text, form, and branding assets to emphasize the skill module and show provider auto-discovery status.
   - Step 3: Document tests needed (auto collection + manual verification) and highlight preserved endpoints (OpenAI-compatible, Google, Anthropic).

## Next Actions
- Confirm any additional legacy feature that must be merged (e.g., Clawdbot instructions, internet tunnel) and append to the inventory.
- After confirmation, mark each task in `docs/tasks/` with dependencies (UI changes, backend logic, QA) to guide implementation.
