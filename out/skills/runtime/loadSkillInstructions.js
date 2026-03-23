import * as fs from 'fs/promises';
import * as path from 'path';
export class SkillInstructionError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SkillInstructionError';
    }
}
const VALID_STEP_TYPES = ['knowledge', 'script', 'pipeline'];
export async function loadSkillInstructions(skill) {
    const skillDir = path.dirname(skill.path);
    const instructionsPath = path.join(skillDir, 'instructions.json');
    let content;
    try {
        content = await fs.readFile(instructionsPath, 'utf-8');
    }
    catch (error) {
        if (error?.code === 'ENOENT') {
            throw new SkillInstructionError(`instructions.json not found for skill ${skill.id}`);
        }
        throw error;
    }
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch (error) {
        throw new SkillInstructionError(`Failed to parse instructions.json for skill ${skill.id}: ${error instanceof Error ? error.message : 'invalid JSON'}`);
    }
    if (!parsed || typeof parsed !== 'object') {
        throw new SkillInstructionError(`Instructions file for skill ${skill.id} must be an object`);
    }
    const entry = parsed;
    const stepsRaw = entry.steps;
    if (!Array.isArray(stepsRaw) || stepsRaw.length === 0) {
        throw new SkillInstructionError(`Instructions for skill ${skill.id} must declare at least one step`);
    }
    const steps = stepsRaw.map((raw, index) => normalizeStep(raw, index));
    return {
        skillId: skill.id,
        steps,
        model: typeof entry.model === 'string' ? entry.model.trim() : undefined,
        version: typeof entry.version === 'string' ? entry.version.trim() : undefined,
        updatedAt: new Date().toISOString()
    };
}
function normalizeStep(entry, index) {
    if (!entry || typeof entry !== 'object') {
        throw new SkillInstructionError(`Instruction step at index ${index} must be an object`);
    }
    const raw = entry;
    const id = typeof raw.id === 'string' && raw.id.trim()
        ? raw.id.trim()
        : `step-${index}`;
    const name = typeof raw.name === 'string' && raw.name.trim()
        ? raw.name.trim()
        : `Step ${index + 1}`;
    const typeRaw = typeof raw.type === 'string' ? raw.type.trim().toLowerCase() : '';
    if (!typeRaw || !VALID_STEP_TYPES.includes(typeRaw)) {
        throw new SkillInstructionError(`Step ${id} has invalid type '${typeRaw}'`);
    }
    const resources = Array.isArray(raw.resources)
        ? raw.resources
            .map(value => (typeof value === 'string' ? value.trim() : ''))
            .filter(Boolean)
        : [];
    return {
        id,
        name,
        type: typeRaw,
        description: typeof raw.description === 'string' ? raw.description.trim() : undefined,
        promptTemplate: typeof raw.promptTemplate === 'string' ? raw.promptTemplate.trim() : undefined,
        script: typeof raw.script === 'string' ? raw.script.trim() : undefined,
        resources
    };
}
//# sourceMappingURL=loadSkillInstructions.js.map