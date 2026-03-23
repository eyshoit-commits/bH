# Task 2: readSkillManifest Interface - Learnings

## Patterns Discovered

### Surface Contract Pattern
- Define interface in dedicated types file (`src/skills/types.ts`)
- Implementation reads/parses in separate module (`src/skills/fs/readSkillManifest.ts`)
- Error types co-located with reader function

### Error Code Pattern
- Use string union type for error codes (e.g., `ReadSkillManifestErrorCode`)
- Augment Error interface with additional properties
- Use `as` cast: `new Error() as ReadSkillManifestError`

### JSDoc Convention
- Document function purpose in block comment
- Use `@param`, `@returns`, `@throws` tags
- Keep descriptions concise

## External References Used
- Azure SDK TypeScript Guidelines for API surface design
- Lobehub/lobehub for SkillManifest pattern (Zod schema + TypeScript type)
- Lightdash for readSkillManifest pattern (returns null vs throws)

## Codebase Alignment
- Error pattern matches existing codebase conventions
- File structure aligns with Phase 1 skill system plan
- TypeScript interface style matches `src/skills/types.ts`
