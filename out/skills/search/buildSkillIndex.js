const TOKEN_SPLIT = /[^a-z0-9]+/g;
export function buildSkillIndex(skills) {
    const tokenMap = new Map();
    const tagMap = new Map();
    const categoryMap = new Map();
    const sourceMap = new Map();
    const skillLookup = new Map();
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
export function tokenize(value) {
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
function trackSource(map, source, skillId) {
    let set = map.get(source);
    if (!set) {
        set = new Set();
        map.set(source, set);
    }
    set.add(skillId);
}
function trackFacet(map, key, skillId) {
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
function toRecord(map) {
    const record = {};
    for (const [key, values] of map.entries()) {
        record[key] = Array.from(values).sort();
    }
    return record;
}
function toRecordSkills(map) {
    const record = {};
    for (const [id, skill] of map.entries()) {
        record[id] = skill;
    }
    return record;
}
//# sourceMappingURL=buildSkillIndex.js.map