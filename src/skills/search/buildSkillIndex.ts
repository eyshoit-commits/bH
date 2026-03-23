import type { CoreSkill, CoreSkillSource } from '../types.ts';

export interface SkillIndexSnapshot {
  tokens: Record<string, string[]>;
  tags: Record<string, string[]>;
  categories: Record<string, string[]>;
  sources: Record<CoreSkillSource, string[]>;
  skills: Record<string, CoreSkill>;
  builtAt: string;
}

const TOKEN_SPLIT = /[^a-z0-9]+/g;

export function buildSkillIndex(skills: CoreSkill[]): SkillIndexSnapshot {
  const tokenMap = new Map<string, Set<string>>();
  const tagMap = new Map<string, Set<string>>();
  const categoryMap = new Map<string, Set<string>>();
  const sourceMap = new Map<CoreSkillSource, Set<string>>();
  const skillLookup = new Map<string, CoreSkill>();

  for (const skill of skills) {
    skillLookup.set(skill.id, skill);
    trackSource(sourceMap, skill.source, skill.id);
    for (const tag of skill.tags) {
      trackFacet(tagMap, tag, skill.id);
    }
    for (const category of skill.categories) {
      trackFacet(categoryMap, category, skill.id);
    }

    const tokens = [
      ...tokenize(skill.name),
      ...tokenize(skill.description),
      ...tokenize(skill.slug),
      ...skill.tags.flatMap(tokenize),
      ...skill.categories.flatMap(tokenize),
    ];

    for (const token of tokens) {
      trackFacet(tokenMap, token, skill.id);
    }
  }

  return {
    tokens: toRecord(tokenMap),
    tags: toRecord(tagMap),
    categories: toRecord(categoryMap),
    sources: toRecord(sourceMap),
    skills: toRecordSkills(skillLookup),
    builtAt: new Date().toISOString(),
  };
}

function tokenize(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(TOKEN_SPLIT)
    .map(token => token.trim())
    .filter(Boolean);
}

function trackSource(map: Map<CoreSkillSource, Set<string>>, source: CoreSkillSource, skillId: string): void {
  let set = map.get(source);
  if (!set) {
    set = new Set();
    map.set(source, set);
  }
  set.add(skillId);
}

function trackFacet(map: Map<string, Set<string>>, key: string, skillId: string): void {
  if (!key) {
    return;
  }
  const normalized = key.toLowerCase();
  let set = map.get(normalized);
  if (!set) {
    set = new Set();
    map.set(normalized, set);
  }
  set.add(skillId);
}

function toRecord(map: Map<string, Set<string>>): Record<string, string[]> {
  const record: Record<string, string[]> = {};
  for (const [key, values] of map.entries()) {
    record[key] = Array.from(values).sort();
  }
  return record;
}

function toRecordSkills(map: Map<string, CoreSkill>): Record<string, CoreSkill> {
  const record: Record<string, CoreSkill> = {};
  for (const [id, skill] of map.entries()) {
    record[id] = skill;
  }
  return record;
}
