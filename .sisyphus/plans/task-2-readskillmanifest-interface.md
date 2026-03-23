# Task 2: readSkillManifest Interface Documentation

## Overview
> Document function signature, input/output contract, and error semantics for the readSkillManifest surface. This is a documentation-only task — no implementation changes.

## Context
- **Depends On**: Task 1 (SkillManifest data model)
- **Phase**: Wave 2
- **Status**: Implementation already exists at `src/skills/fs/readSkillManifest.ts`

## Deliverables

### D1: Function Signature Documentation
- **Location**: `src/skills/fs/readSkillManifest.ts` (existing)
- **Signature**: `readSkillManifest(filePath: string): Promise<SkillManifest>`
- **JSDoc**: Complete with `@param`, `@returns`, `@throws`

### D2: Error Semantics Documentation
- **Error Codes**: Document each code's trigger condition
- **Error Interface**: Document `ReadSkillManifestError` shape
- **Error Flow**: Document how callers should handle errors

### D3: Example Usage
- Happy path example
- Error handling flow examples

## Technical Specification

### Function Signature
```typescript
/**
 * Read and parse a single skill manifest file.
 *
 * @param filePath - Absolute path to the manifest file (.md)
 * @returns Promise resolving to SkillManifest
 * @throws ReadSkillManifestError on failure
 */
export async function readSkillManifest(filePath: string): Promise<SkillManifest>
```

### Error Types (Documentation Only — Not Implemented)

#### Error Codes
| Code | Trigger Condition |
|------|-------------------|
| `ERR_FILE_NOT_FOUND` | File does not exist at `filePath` |
| `ERR_READ_FILE` | File exists but cannot be read (permissions, I/O error) |
| `ERR_PARSE_FRONTMATTER` | File content lacks valid YAML frontmatter (`---` delimiters) |
| `ERR_INVALID_MANIFEST` | Frontmatter missing required fields (id, name, version, description) |

#### Error Interface
```typescript
export interface ReadSkillManifestError extends Error {
  code: ReadSkillManifestErrorCode;
  manifestPath?: string;
}
```

### Example Usage

#### Happy Path
```typescript
import { readSkillManifest } from './skills/fs/readSkillManifest';

const manifest = await readSkillManifest('/workspace/.vscode/skills/my-skill.md');
console.log(manifest.id);    // "my-skill"
console.log(manifest.name);  // "MySkill"
```

#### Error Handling Flow
```typescript
import { readSkillManifest, ReadSkillManifestError } from './skills/fs/readSkillManifest';

try {
  const manifest = await readSkillManifest(path);
} catch (error) {
  if (error instanceof ReadSkillManifestError) {
    switch (error.code) {
      case 'ERR_FILE_NOT_FOUND':
        // Handle missing file
        break;
      case 'ERR_READ_FILE':
        // Handle I/O error
        break;
      case 'ERR_PARSE_FRONTMATTER':
        // Handle malformed frontmatter
        break;
      case 'ERR_INVALID_MANIFEST':
        // Handle missing required fields
        break;
    }
  }
  throw error; // Re-throw if not a ReadSkillManifestError
}
```

## TDD-Oriented QA Scenarios

### Scenario 1: Happy Path — Valid Manifest
- **Input**: Valid `.md` file with YAML frontmatter containing all required fields
- **Expected**: Returns `SkillManifest` object with all fields populated
- **Validation**: `npx tsc --noEmit` + manual verification

### Scenario 2: Error — File Not Found
- **Input**: Non-existent file path
- **Expected**: Throws `ReadSkillManifestError` with code `ERR_FILE_NOT_FOUND`
- **Validation**: Error message contains path, error.code === 'ERR_FILE_NOT_FOUND'

### Scenario 3: Error — Invalid Frontmatter
- **Input**: `.md` file without `---` frontmatter delimiters
- **Expected**: Throws with code `ERR_PARSE_FRONTMATTER`
- **Validation**: Error code matches expectation

### Scenario 4: Error — Missing Required Field
- **Input**: Valid frontmatter missing `version` field
- **Expected**: Throws with code `ERR_INVALID_MANIFEST`
- **Validation**: Error message indicates missing field

## Atomic Commit Strategy

### Commit Message
```
docs(skill): document readSkillManifest interface contract

- Document function signature with JSDoc
- Document error codes and error interface
- Add example usage patterns for callers
- Reference SkillManifest type from src/skills/types.ts
```

### Files Changed
- `src/skills/fs/readSkillManifest.ts` (documentation only)

## Notes
- This task documents existing implementation — no code changes required
- Error types (FileNotFoundError, InvalidManifestError) mentioned for documentation but NOT implemented as separate classes
- Existing error code pattern is preserved (string union type)

## Verification Checklist
- [ ] Function signature documented with JSDoc
- [ ] All 4 error codes documented with trigger conditions
- [ ] ReadSkillManifestError interface documented
- [ ] Example usage provided (happy path + error handling)
- [ ] References SkillManifest type from src/skills/types.ts
- [ ] Commit follows conventional commit format
