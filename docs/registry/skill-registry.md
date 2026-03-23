SkillRegistry Interface & Startup Lifecycle
=================================================

Scope
- Provide an in-memory registry surface that discovers and exposes skills, without persisting state.
- The registry loads SkillManifest data at startup from a directory, keeps it in memory, and serves it read‑only via the API.

Key Concepts
- SkillManifest: a lightweight description of a skill surfaced by the registry.
- InMemorySurface: the runtime representation of discovered skills stored in memory only.
- StartupLifecycle: the sequence of loading manifests at startup and exposing them to API consumers.

1) In-Memory Registry Interface (sketch)
```ts
// Skill manifest shape used by the registry surface
export interface SkillManifest {
  id: string;          // unique identifier, e.g. "/org/skill-name"
  name: string;        // human-friendly name
  version?: string;    // optional semantic version
  description?: string;// short description of the skill
  capabilities?: string[]; // optional list of capabilities or surface hints
  // additional optional fields may be added in future without breaking surface
}

// Minimal registry surface contract
export interface SkillRegistry {
  // Load skills from a filesystem directory. Implementations MUST be asynchronous.
  loadSkillsFromDirectory(path: string): Promise<void>;

  // Return the currently discovered skills as a read-only array.
  getSkills(): SkillManifest[];
}
```

Rationale:
- The interface is intentionally small to minimize surface area and allow different runtime implementations (e.g., in-memory only, or test doubles).
- loadSkillsFromDirectory reads manifests describing skills from a directory and populates the in-memory surface.
- getSkills returns a stable, read-only snapshot of discovered skills for clients and downstream API routes.

2) Startup Lifecycle (on-startup, read-only surface)
```
1. Application startup
   - Initialize SkillRegistry in-memory implementation.
   - Call loadSkillsFromDirectory("<path-to-skills>"); this is a startup-time operation.
2. Discovery
   - Registry scans the directory, loads all SkillManifest descriptors, and stores them in memory.
   - No persistence is performed; registry state is ephemeral and lives only in process memory.
3. Surfacing
   - Expose an API endpoint (GET /v1/skills) that returns SkillManifest[] from getSkills().
4. Cache/Invalidation (placeholder)
   - If desired, implement a tiny in-memory cache with a short TTL for the surface; fresh loads occur only on startup.
```

Notes:
- The startup path is read-only from the API consumer perspective; there is no write-back to storage.
- Any changes to skill manifests require a restart or a controlled reload, but this task focuses on the startup surface only.

3) API Surfacing (GET /v1/skills)
- The API endpoint consumes the in-memory surface and returns SkillManifest[] as JSON.
- Example response:
  [
    { "id": "/acme/echo", "name": "Echo Skill", "version": "1.0.0", "description": "Echoes input", "capabilities": ["echo"] }
  ]

4) Alignment with existing patterns (Context)
- Context: Review registry patterns in gateway/model (mergeModels, normalizeModel) for alignment with manifest shapes and surface normalization.
- AST check: Search for SkillManifest usage in registry contexts to ensure compatibility. This task will reference outputs from context7 and ast-grep to align naming and fields if they exist in the codebase.

5) Simple ASCII lifecycle diagram
  +-----------+        +-----------+        +-----------------+
  | Startup   | -----> | In-memory | -----> | API Surface:    |
  | Phase     |        | Surface   |        | GET /v1/skills   |
  +-----------+        +-----------+        +-----------------+
        |                  |                       |
        v                  v                       v
  (load manifests)   (store in memory)       (return manifests)

6) Reference Outputs (Plan Alignment)
- This documentation references Task 1-3 outputs: interface sketch, startup lifecycle, and API exposure.
- It purposefully avoids implementing a filesystem watcher or persistence layer; the task scope is strictly the in-memory surface and its startup behavior.

Appendix: Rationale for design decisions
- Small, explicit interface keeps surface stable across engine boundaries.
- Read-only API surface reduces risk of accidental mutation and simplifies reasoning about manifests.
- Startup-only load aligns with lightweight discovery semantics and avoids complex runtime reloads.

End of SKU: SkillRegistry interface & startup lifecycle sketch
