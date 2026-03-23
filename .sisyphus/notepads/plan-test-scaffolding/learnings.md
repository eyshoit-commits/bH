Learnings from planning phase:
- Reused existing test style (node:test with TS) as observed in src/jsonBodyParser.test.ts.
- The test scaffold emphasizes atomic, well-scoped tests per surface area (SkillManifest, readSkillManifest, discoverSkills, SkillRegistry, API endpoint, configuration).
- Destination fixtures should be under tests/fixtures and mirror real manifest structures the code expects.
- Use a two-happy-two-edge approach per surface to ensure both normal operation and failure modes are covered.
- Validate with the repository's compile/tests flow (tsc compile, then vscode-test) to ensure compatibility with the extension test harness.
- Document all decisions in the notepad for traceability.
