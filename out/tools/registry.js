import { ToolRegistry } from './toolRegistry';
const registry = new ToolRegistry();
export function getToolRegistry() {
    return registry;
}
export function resetToolRegistry() {
    registry.clear();
}
//# sourceMappingURL=registry.js.map