# Phase 4 — Native Skill Runtime Design

## Context
- Phase 1/2/3 deliver the vanilla registry, search, tool catalog, and `/v1/tools` endpoint. Every skill now has normalized metadata and registered tools with basic validation.
- Phase 4 is the first mutative phase: we must load runtime assets from disk, wire skill instructions to callable APIs, resolve dependencies, and execute tools without spawning external runtimes—all inside the gateway core.
- This runtime layer also prepares the control plane hooks (rejections, logs, admin telemetry) needed for the later dashboard extensions.

## Objectives
1. Load `instructions` (e.g., prompt templates, steps, script references) from each skill folder, normalize them, and cache them per skill.
2. Resolve external resources declared by a skill (files, tool scripts) via `resolveSkillResources` so the executor has local paths.
3. Implement `invokeSkillTool` that accepts a tool id, validates inputs, merges runtime stage data, and executes the tool via inline handlers (plain JS/TS modules or structured prompt sequences).
4. Introduce POST `/v1/tools/execute` that routes requests to the runtime executor, applies validation, returns tool outputs, and logs execution metadata/errors.
5. Keep everything synchronous/randomness-limited to keep observability simple; store execution logs in memory for admin surface later.

## Component Breakdown

### `src/skills/runtime/loadSkillInstructions.ts`
- Loads `instructions.json`/`instruction.md` from each skill, validates required fields (steps, type), normalizes `injection`, `model`, `tools` references, and keeps versions for hot reloads.

### `src/skills/runtime/resolveSkillResources.ts`
- Given a skill and its instruction set, resolves referenced files/scripts against the skill folder, throws structured errors if missing, and returns absolute paths for the executor.

### `src/skills/runtime/invokeSkillTool.ts`
- Core runtime function that:
  - Validates request payload (tool id + inputs).
  - Looks up the `CoreTool` and instructions (if needed).
  - Loads resource artifacts (local scripts, prompt templates).
  - Executes the tool via the appropriate driver (e.g., `knowledge` uses templated prompts, `script` executes the local file in a sandboxed context, `pipeline` orchestrates both).
  - Returns `{ result, logs, updatedAt }` and logs success/failure for admin use.

### Gateway POST `/v1/tools/execute`
- Parses JSON body, ensures `tool_id` and `input` exist, forwards to `invokeSkillTool`, catches `ToolExecutionError`, `ApiError`, and returns structured responses with latency metrics.

## Data Flow
1. Discovery already calls `registerSkillTools`; extend it to also preload instructions/resources so runtime is ready when a tool executes.
2. The runtime executor references the registry/tool snapshot (from Phase 3) and resource cache (from `resolveSkillResources`).
3. Execution results or failures are logged to a runtime trace store; the admin dashboard will later surface these traces.

## API Contract
- `POST /v1/tools/execute`
  - Body: `{ tool_id: string; input: Record<string, unknown>; context?: Record<string, unknown> }`
  - Response: `{ object: 'tool_execution', tool_id, response, logs: TraceEntry[], tookMs }`
  - Errors: structured via `ApiError` (e.g., `tool_not_found`, `validation_error`, `execution_error`).

## Observability
- Runtime logs include timestamp, tool id, skill id, input hash, outcome (success/failure), and error stack if available.
- Execution latency is tracked so admin UI cards can show performance trends.
- The runtime reuses the rejection logging channel established in earlier phases for resource/script issues.

## Testing Strategy
- Unit tests for `loadSkillInstructions` and `resolveSkillResources` covering valid instructions, missing files, malformed references.
- Unit tests for `invokeSkillTool` verifying tool lookup, validation, mocking execution drivers (e.g., stub prompt execution) and error paths.
- Integration tests for POST `/v1/tools/execute`, using the in-memory registry/tools seeds to mimic a skill and ensuring success and error responses.
- Ensure type checking and lint remain clean; no `eval` or unsafe global access is introduced.
