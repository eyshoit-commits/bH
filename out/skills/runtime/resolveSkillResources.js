import * as fs from 'fs/promises';
import * as path from 'path';
export class SkillResourceError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SkillResourceError';
    }
}
export async function resolveSkillResources(skill, instructions) {
    const skillDir = path.dirname(skill.path);
    const scriptPaths = {};
    const resources = new Set();
    for (const step of instructions.steps) {
        if (step.script) {
            const scriptPath = path.join(skillDir, step.script);
            await ensureFileExists(scriptPath, `Script for step ${step.id} not found`);
            scriptPaths[step.id] = scriptPath;
        }
        for (const resource of step.resources ?? []) {
            const resourcePath = path.join(skillDir, resource);
            await ensureFileExists(resourcePath, `Resource ${resource} referenced by step ${step.id} not found`);
            resources.add(resourcePath);
        }
    }
    for (const resource of instructions.steps.flatMap(step => step.resources ?? [])) {
        const resourcePath = path.join(skillDir, resource);
        resources.add(resourcePath);
    }
    return {
        scriptPaths,
        resources: [...resources]
    };
}
async function ensureFileExists(filePath, message) {
    try {
        const stats = await fs.stat(filePath);
        if (!stats.isFile()) {
            throw new SkillResourceError(message);
        }
    }
    catch (error) {
        if (error?.code === 'ENOENT') {
            throw new SkillResourceError(message);
        }
        throw error;
    }
}
//# sourceMappingURL=resolveSkillResources.js.map