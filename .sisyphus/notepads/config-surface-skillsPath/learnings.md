Learnings from configuring skillsPath surface
- Documented the default path and override mechanisms clearly for future teams.
- Confirmed that VS Code settings surface is githubCopilotApi.skills.path and can be overridden by an environment variable named GITHUB_COPILOT_API_SKILLS_PATH.
- Precedence: environment variable > settings > default.
- Resolved the approach to relative vs absolute path handling and provided concrete examples.
