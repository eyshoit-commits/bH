SkillManifest schema documentation (phase 1 — skill system)

This document describes a machine-readable manifest schema for Skill manifests used by the gateway/model registry. It is intended to be the source of truth for tooling and validation checks, and to guide future code changes.

1) YAML manifest example
```yaml
id: example.skill
name: Example Skill
version: 1.0.0
description: A minimal example manifest
source: local
path: skills/example
tags:
  - example
category: example
alwaysApply: false
```

2) JSON Schema (machine-readable)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SkillManifest",
  "type": "object",
  "required": ["id", "name", "version", "description"],
  "properties": {
    "id": {"type": "string"},
    "name": {"type": "string"},
    "version": {"type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$"},
    "description": {"type": "string"},
    "source": {"type": "string", "enum": ["local","git","bundled","provider"]},
    "path": {"type": "string"},
    "tags": {"type": "array", "items": {"type": "string"}},
    "category": {"type": "string"},
    "alwaysApply": {"type": "boolean"}
  },
  "additionalProperties": true
}
```

3) Validation contract (high level)
- Required fields must be present: id, name, version, description.
- Version must follow semantic versioning pattern: major.minor.patch (e.g., 1.2.3).
- Unknown fields should be ignored or logged by validators; manifest parsing should not fail solely due to extra keys.
- Field types must match: id, name, description, path, source, category as strings; tags as string array; alwaysApply as boolean.
- If a field fails type or pattern validation, report an error referencing the manifest path for easy debugging.

4) Cross-reference to code
- Current SkillManifest interface (src/skills/types.ts) defines the minimal surface contract with required fields: id, name, version, description.
- Optional fields in code today include: source and path.
- This document extends the manifest surface with optional fields: tags, category, alwaysApply. These fields are not yet present in the code as required/optional properties of SkillManifest; they should be aligned in a future code change. See src/skills/types.ts for the current structure.

5) Cross-reference notes
- Code reference: SkillManifest interface in src/skills/types.ts
- The interface currently contains at least the following required fields:
  - id: string
  - name: string
  - version: string
  - description: string
- Optional fields currently defined: source?: 'local' | 'git' | 'bundled' | 'provider'; path?: string;
- See the examples and JSON Schema above to align on optional fields to be added in code.

6) Example manifest for tests
- id: example.skill
- name: Example Skill
- version: 1.0.0
- description: A minimal example manifest for tests
- source: local
- path: skills/example
- tags: [example]
- category: example
- alwaysApply: false

Note: This documentation is for planning and validation purposes only and does not modify runtime code or endpoints.
