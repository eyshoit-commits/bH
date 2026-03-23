import { discoverSkills, getDiscoveryRejections, clearDiscoveryRejections } from '../fs/discoverSkills';
import { registerSkillTools } from '../../tools/registerSkillTools';
import { getToolRegistry, resetToolRegistry } from '../../tools/registry';
export class SkillRegistry {
    skills = new Map();
    rejections = [];
    lastRefresh = null;
    sourcePath = '';
    async loadFromDirectory(directoryPath) {
        clearDiscoveryRejections();
        const discovered = await discoverSkills(directoryPath);
        this.skills.clear();
        this.rejections = [];
        this.sourcePath = directoryPath;
        resetToolRegistry();
        const toolRegistry = getToolRegistry();
        for (const entry of getDiscoveryRejections()) {
            this.rejections.push({
                manifestPath: entry.manifestPath,
                reason: entry.reason,
                timestamp: new Date().toISOString()
            });
        }
        for (const skill of discovered) {
            if (this.skills.has(skill.id)) {
                this.rejections.push({
                    manifestPath: skill.path,
                    reason: `Duplicate skill id ${skill.id}`,
                    timestamp: new Date().toISOString(),
                    skillId: skill.id
                });
                continue;
            }
            this.skills.set(skill.id, skill);
            try {
                await registerSkillTools(skill, toolRegistry);
            }
            catch (error) {
                this.rejections.push({
                    manifestPath: skill.path,
                    reason: error instanceof Error ? error.message : 'Failed to register tools',
                    timestamp: new Date().toISOString(),
                    skillId: skill.id
                });
            }
        }
        this.lastRefresh = new Date().toISOString();
    }
    getSkills() {
        return [...this.skills.values()].sort((a, b) => a.slug.localeCompare(b.slug));
    }
    getSnapshot() {
        return {
            skills: this.getSkills(),
            rejections: [...this.rejections],
            lastRefresh: this.lastRefresh,
            sourcePath: this.sourcePath
        };
    }
    getRejections() {
        return [...this.rejections];
    }
    getLastRefresh() {
        return this.lastRefresh;
    }
}
//# sourceMappingURL=skillRegistry.js.map