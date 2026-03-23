import type { CoreSkill } from '../types';
import { discoverSkills, getDiscoveryRejections, clearDiscoveryRejections } from '../fs/discoverSkills';
import { registerSkillTools } from '../../tools/registerSkillTools';
import { getToolRegistry, resetToolRegistry } from '../../tools/registry';

export interface SkillRejection {
  manifestPath: string;
  reason: string;
  timestamp: string;
  skillId?: string;
}

export interface SkillRegistrySnapshot {
  skills: CoreSkill[];
  rejections: SkillRejection[];
  lastRefresh: string | null;
  sourcePath: string;
}

export class SkillRegistry {
  private skills = new Map<string, CoreSkill>();
  private rejections: SkillRejection[] = [];
  private lastRefresh: string | null = null;
  private sourcePath: string = '';

  async loadFromDirectory(directoryPath: string): Promise<void> {
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
      } catch (error) {
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

  getSkills(): CoreSkill[] {
    return [...this.skills.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  getSnapshot(): SkillRegistrySnapshot {
    return {
      skills: this.getSkills(),
      rejections: [...this.rejections],
      lastRefresh: this.lastRefresh,
      sourcePath: this.sourcePath
    };
  }

  getRejections(): SkillRejection[] {
    return [...this.rejections];
  }

  getLastRefresh(): string | null {
    return this.lastRefresh;
  }
}
