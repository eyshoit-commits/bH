# githubCopilotApi.skills.path configuration surface

- Overview
- Default value: .vscode/skills
- Override mechanisms
- Resolution rules and precedence
- Examples (relative, absolute, workspace vs. environment)
- Verification scenario
- References to VS Code WorkspaceConfiguration patterns

This document describes how the skillsPath surface is configured for the GitHub Copilot API integration. The path is exposed as a WorkspaceConfiguration setting at githubCopilotApi.skills.path and can be overridden by an environment variable. The default is a path relative to the workspace root.

1) Default path
- The default value is ".vscode/skills". When no override is provided, this relative path is resolved against the workspace root.

2) Override mechanisms
- VS Code Settings (workspace or user):
  - Setting key: githubCopilotApi.skills.path
  - Accepts a relative or absolute path. If relative, it is resolved relative to the workspace root.
- Environment variable override (preferred):
  - Name: GITHUB_COPILOT_API_SKILLS_PATH
  - If set, its value takes precedence over the VS Code setting and default.
- Precedence order: environment variable > VS Code setting > default

3) Path resolution rules
- If the provided path is absolute (starts with / on POSIX or a drive letter on Windows), use it as-is.
- If the path is relative, resolve it relative to the workspace root (the folder opened in VS Code).
- Environment variable, if set, overrides both the setting and the default.
- It is expected that the resolved path points to a directory containing skill artifacts.

4) Examples
- Default behavior (no override):
  - workspace root: /workspace
  - resolved skillsPath: /workspace/.vscode/skills

- Relative override via VS Code setting:
  - settings.json: { "githubCopilotApi.skills.path": "config/skills" }
  - resolved: /workspace/config/skills

- Absolute override via VS Code setting:
  - settings.json: { "githubCopilotApi.skills.path": "/opt/skills" }
  - resolved: /opt/skills

- Environment variable override (takes precedence):
  - export GITHUB_COPILOT_API_SKILLS_PATH="/home/user/skills" (Linux/macOS) or set GITHUB_COPILOT_API_SKILLS_PATH=C:\skills (Windows)
  - resolved: /home/user/skills

- If both env var and setting are provided, the env var value wins.

5) Verification – example resolution walk-through
- Given workspace root: /my/workspace
- No env var set and no setting: resolves to /my/workspace/.vscode/skills
- Setting set to "work/tools" -> /my/workspace/work/tools
- Env var set to "/external/skills" -> /external/skills

6) Notes
- The surface is designed to be simple and explicit. It relies on the common VS Code WorkspaceConfiguration pattern.
- See the VS Code API docs for getConfiguration and how settings are consumed in extensions.

7) References (workspace conventions)
- Typical pattern: const config = vscode.workspace.getConfiguration('githubCopilotApi'); const skillsPath = config.get<string>('skills.path', '.vscode/skills');
- Environment overrides commonly implemented by reading process.env and preferring that value when defined.

Appendix: Context sources
- VS Code WorkspaceConfiguration patterns and sample usage have been gathered from community documentation and examples in VS Code extension tooling. See references in the project planning notes.

End of document.
