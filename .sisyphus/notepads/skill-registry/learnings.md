SkillRegistry interface & startup lifecycle – learnings
- Emphasized in-memory surface: registry data is loaded into memory at startup and surfaced read-only via API (no persistence across restarts).
- Discovery pattern: directory-based discovery of SkillManifest objects, then deduplicated in-memory list surfaced through GET /v1/skills.
- Surface contract: the API exposes SkillManifest[] as a read-only surface; mutation is out of scope.
- Alignment with existing registry patterns: mirror of gateway/model registry approaches (load, normalize, expose) without writing to disk.
- Validation points: ensure unique IDs, sane versioning, and non-empty fields present in manifests.
- Risks: startup-time cost proportional to number of skills; consider lazy or parallel loading if the environment requires fast boot.
- Next steps: implement a lightweight in-memory registry class and wire it to startup lifecycle and API layer in a follow-up task.
