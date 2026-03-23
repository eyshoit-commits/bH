export const DEFAULT_SKILL_PATH = '.vscode/skills';
const SKILLS_SECTION = 'githubCopilotApi.skills';
let testHost;
export function setSkillConfigHostForTests(host) {
    testHost = host;
}
function resolveRuntimeHost() {
    if (testHost) {
        return testHost;
    }
    try {
        const vscode = require('vscode');
        if (!vscode.workspace) {
            return undefined;
        }
        return {
            workspace: {
                getConfiguration(section) {
                    return vscode.workspace.getConfiguration(section);
                }
            }
        };
    }
    catch {
        return undefined;
    }
}
export function resolveSkillPath() {
    const host = resolveRuntimeHost();
    const config = host?.workspace?.getConfiguration(SKILLS_SECTION);
    if (config) {
        const configuredPath = config.get('path', DEFAULT_SKILL_PATH);
        return configuredPath ?? DEFAULT_SKILL_PATH;
    }
    return DEFAULT_SKILL_PATH;
}
//# sourceMappingURL=config.js.map