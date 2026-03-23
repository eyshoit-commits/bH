export const DEFAULT_SKILL_PATH = '.vscode/skills';
const SKILLS_SECTION = 'githubCopilotApi.skills';

export interface SkillConfigHost {
  workspace: {
    getConfiguration(section: string): {
      get<T>(key: string, defaultValue: T): T;
    };
  };
}

let testHost: SkillConfigHost | undefined;

export function setSkillConfigHostForTests(host?: SkillConfigHost): void {
  testHost = host;
}

function resolveRuntimeHost(): SkillConfigHost | undefined {
  if (testHost) {
    return testHost;
  }
  try {
    const vscode = require('vscode') as typeof import('vscode');
    if (!vscode.workspace) {
      return undefined;
    }
    return {
      workspace: {
        getConfiguration(section: string) {
          return vscode.workspace.getConfiguration(section) as any;
        }
      }
    };
  } catch {
    return undefined;
  }
}

export function resolveSkillPath(): string {
  const host = resolveRuntimeHost();
  const config = host?.workspace?.getConfiguration(SKILLS_SECTION);
  if (config) {
    const configuredPath = config.get<string>('path', DEFAULT_SKILL_PATH);
    return configuredPath ?? DEFAULT_SKILL_PATH;
  }
  return DEFAULT_SKILL_PATH;
}
