# Task 2: readSkillManifest Interface - Issues & Gotchas

## Known Limitations

### 1. Simple Frontmatter Parser
- **Issue**: Regex-based parser doesn't handle multiline values or complex YAML
- **Impact**: Manifests with complex YAML (arrays, nested objects) will fail
- **Workaround**: Keep frontmatter simple (flat key:value pairs)

### 2. Error Interface Augmentation
- **Issue**: Using `as` cast to augment Error interface (`new Error() as ReadSkillManifestError`)
- **Impact**: Not type-safe at runtime, relies on duck-typing
- **Note**: This pattern exists in codebase already

### 3. No Schema Validation Runtime
- **Issue**: No Zod or runtime validator — type checking is compile-time only
- **Impact**: Invalid manifest content passes TypeScript but fails at runtime
- **Future Consideration**: Could add Zod validation if more robust parsing needed

## Patterns Observed

### Existing Error Pattern in Codebase
- Error code unions used elsewhere (e.g., AuditService)
- Error augmentation via `as` cast is established pattern
- Error interface extends Error with additional properties

## Questions for Future Tasks
- Should we upgrade to a full YAML parser?
- Should we add Zod schema validation?
- Should we create dedicated error classes vs error codes?
