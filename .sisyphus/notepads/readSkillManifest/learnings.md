### ReadSkillManifest - Learnings
- Documented the interface surface for readSkillManifest(filePath: string): Promise<SkillManifest>.
- SkillManifest type is sourced from src/skills/types.ts and ensures consistent surface for gateway/model interaction.
- Defined error semantics: FileNotFoundError when the manifest file is missing; InvalidManifestError when the manifest content fails validation.
- This task is documentation-only; implementation details (IO) are intentionally omitted.
