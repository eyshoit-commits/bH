import { resolveSkillPath } from './config';
import { SkillRegistry } from './registry/skillRegistry';
const registry = new SkillRegistry();
export async function loadSkillsFromDirectory(directoryPath) {
    await registry.loadFromDirectory(directoryPath);
}
export async function loadDefaultSkills() {
    const path = resolveSkillPath();
    await registry.loadFromDirectory(path);
}
export function getSkills() {
    return registry.getSkills();
}
export function getSkillSnapshot() {
    return registry.getSnapshot();
}
export function getSkillRejections() {
    return registry.getRejections();
}
export { SkillRegistry };
//# sourceMappingURL=registry.js.map