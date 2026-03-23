# Phase 3 — Native Skill Tool Layer Design

## Context
- Phase 1 delivered a read-only registry of normalized `CoreSkill` metadata plus `GET /v1/skills`.
- Phase 2 introduced an in-memory search index, ranking layer, and `GET /v1/skills/search`.
- Phase 3 builds on that by exposing each skill's actionable tools/commands, validating inputs, and surfacing the tool catalog through the gateway without invoking external MCP tooling.

## Objectives
1. Establish a `ToolRegistry` that tracks all known tools by skill, including metadata, input schemas, and type classifications (`knowledge`, `script`, `pipeline`).
2. Map skills to their declared tools, allowing lookups by skill id or tool id and enabling meta-information like `toolType`, `enabled`, `dependencies`, and `tags`.
3. Expose `GET /v1/tools` that returns the catalog of gateway-native tools with schemas that can be consumed by LLMs or the dashboard.
4. Provide input validation utilities so future runtime execution (Phase 4) can rely on consistent, sanitized inputs.
5. Keep everything in TypeScript within the gateway, avoid MCP-managed tool JSON, and log invalid definitions early.

## Component Breakdown

### `src/tools/toolRegistry.ts`
- Maintains a `Map<string, CoreTool>` by tool id plus index-by-skill. Supports registration, enabling/disabling, listing, and snapshot exports. Enforces uniqueness, tracks `updatedAt`, and can return `CoreToolPreview` objects for the API. Throws structured errors when duplicates or invalid metadata appear.

### `src/tools/registerSkillTools.ts`
- Parses tool declarations from skill manifests (new `tools` frontmatter block) or a dedicated `tools.json` inside each skill. Normalizes definitions into `CoreTool` objects (id derived from skill id + slug). Registers them with `ToolRegistry`, logs rejections, and returns metadata-only lists. Called by discovery/registry refresh so the tool catalog is always in sync with discovered skills.

### `src/tools/validateToolInput.ts`
- Exposes helpers to enforce simple Joi-like constraints (required fields, scalar/string/array types, tags). For Phase 3 we implement schema validation for `inputSchema` definitions present in the manifests so the tool registry can reject malformed tool definitions before runtime. This module also provides runtime-callable validators so Phase 4’s executor can reuse the same logic.

### Gateway `GET /v1/tools`
- Adds a new HTTP route that returns `object: 'list', data: toolRegistry.list()` plus metadata (tool counts per skill, total dependencies). Accepts filters (optional query parameters for `skillId` or `toolType`) eventually used by the admin panel.

## Data Flow
1. Discovery/Phase 1 registry reads `SKILL.md` plus optional tool metadata, normalizes tools via `registerSkillTools`.
2. `ToolRegistry` keeps canonical tool state and publishes snapshots that the gateway endpoint consumes.
3. `validateToolInput` ensures tool metadata schemas are safe before registration and can be reused later when executing the tools.
4. Admin/dashboard cards (Phase 6) will query `/v1/tools` to show coverage and highlight disabled/rejected tools.

## API Contract
- `GET /v1/tools`
  - Optional query parameters: `skillId`, `toolType`, `status` (for future use).
  - Response: `{ object: 'list', data: CoreToolPreview[], total: number }`.
  - Each `CoreToolPreview` includes `id`, `skillId`, `name`, `description`, `toolType`, `tags`, `enabled`, `updatedAt`, and `inputSchema`.

## Error Handling and Observability
- Logging for rejected tool manifests should reuse the rejection mechanism established in Phase 1.
- Duplicate tool ids or invalid schemas throw structured errors captured in the discovery log.
- Gateway endpoint includes `toolRegistry.lastRefresh` and rejection count in the metadata headers or response (if needed later).

## Testing Strategy
- Unit tests for `toolRegistry` covering registration, duplicates, listing, and filtering.
- Tests for `registerSkillTools` ensuring valid tool definitions register correctly, invalid definitions are rejected, and `Skill` tools list returns metadata.
- Schema validation tests for `validateToolInput`.
- Integration test for `GET /v1/tools`, mocking a registry snapshot.
