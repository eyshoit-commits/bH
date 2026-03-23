# ReadSkillManifest interface contract

This document defines the public contract for the readSkillManifest(filePath) function. It mirrors the actual runtime behavior documented in code located at src/skills/fs/readSkillManifest.ts and the SkillManifest type defined in src/skills/types.ts.

## Signature

```yaml
signature: readSkillManifest(filePath: string): Promise<SkillManifest>
```

## Input

- filePath: string — path to the manifest file on disk.

## Output

- manifest: SkillManifest — the validated skill manifest object.

## Errors (ReadSkillManifestErrorCode)

- ERR_FILE_NOT_FOUND — file does not exist at the provided path.
- ERR_READ_FILE — the file could not be read (e.g., permission issues).
- ERR_PARSE_FRONTMATTER — no valid YAML frontmatter found in the manifest.
- ERR_INVALID_MANIFEST — the manifest failed structural validation or normalization.

## Error semantics
- The function throws an error implementing ReadSkillManifestError with a code from the above set.
- Each error includes an optional manifestPath property indicating the path that caused the error when available.

## Cross-reference to code
- readSkillManifest signature: src/skills/fs/readSkillManifest.ts
- SkillManifest type: src/skills/types.ts (type alias: SkillManifest = CoreSkill)
- CoreSkill and CoreSkillManifest are defined in src/skills/types.ts and normalized via normalizeCoreSkill.

## Validation semantics (summary)
- Existence check for the provided file path is enforced.
- YAML frontmatter is parsed and validated.
- The manifest is normalized to a CoreSkill structure before returning as SkillManifest.

## Examples

### Happy path
```yaml
signature: readSkillManifest(filePath: string): Promise<SkillManifest>
input:
  filePath: '/path/to/skill-manifest.yaml'
output:
  manifest: SkillManifest
```

### Error paths
- Not found:
```yaml
signature: readSkillManifest(filePath: string): Promise<SkillManifest>
input:
  filePath: '/path/to/missing.yaml'
errors:
  - ERR_FILE_NOT_FOUND
```
- Invalid manifest content:
```yaml
signature: readSkillManifest(filePath: string): Promise<SkillManifest>
input:
  filePath: '/path/to/invalid.yaml'
errors:
  - ERR_INVALID_MANIFEST
```

## JSON Schema (conceptual)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ReadSkillManifestSignature",
  "type": "object",
  "properties": {
    "filePath": {"type": "string"}
  },
  "required": ["filePath"]
}
```

## Cross-reference references
- src/skills/fs/readSkillManifest.ts
- src/skills/types.ts

## Validation notes
- File existence is enforced at the earliest stage.
- YAML frontmatter is validated and parsed into a manifest object.
- Manifest structure is validated/normalized to CoreSkill and then returned as SkillManifest.

## Test / QA Scenarios
- Happy path: a valid manifest file exists and returns a SkillManifest.
- Not found: non-existent file triggers ERR_FILE_NOT_FOUND.
- Invalid content: manifest missing required fields or invalid frontmatter triggers ERR_INVALID_MANIFEST.

## Notes
- Documentation-only task; no runtime code changes.

**Acceptance Criteria mapping**
- Documentation contains explicit function signature, error codes, and example usage.
- Clear cross-reference to code types.
- Notepad updated.
