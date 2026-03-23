import type { CoreSkill, CoreSkillSource } from '../types.ts';
import type { SkillIndexSnapshot } from './buildSkillIndex.ts';
import { tokenize } from './buildSkillIndex.ts';
import { rankSkills, type RankCandidate, type RankedSkill } from './rankSkills.ts';

export interface SearchParams {
  query?: string;
  tags?: string[];
  categories?: string[];
  source?: CoreSkillSource;
  limit?: number;
  offset?: number;
  includeDebug?: boolean;
}

export interface SearchResult {
  skills: CoreSkill[];
  total: number;
  tookMs: number;
  debug?: RankedSkill[];
}

export class SearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SearchError';
  }
}

interface CandidateStats {
  tokenHits: number;
  tagMatches: number;
  categoryMatches: number;
  updatedAt: string;
}

export function searchSkills(params: SearchParams, snapshot: SkillIndexSnapshot): SearchResult {
  const limit = params.limit ?? 25;
  const offset = params.offset ?? 0;
  if (limit <= 0) {
    throw new SearchError('limit must be greater than zero');
  }
  if (offset < 0) {
    throw new SearchError('offset cannot be negative');
  }

  const start = Date.now();
  const normalizedTags = normalizeFilters(params.tags);
  const normalizedCategories = normalizeFilters(params.categories);

  const stats = new Map<string, CandidateStats>();

  const ensureCandidate = (id: string): CandidateStats => {
    let entry = stats.get(id);
    if (!entry) {
      const skill = snapshot.skills[id];
      entry = {
        tokenHits: 0,
        tagMatches: 0,
        categoryMatches: 0,
        updatedAt: skill?.updatedAt ?? new Date().toISOString(),
      };
      stats.set(id, entry);
    }
    return entry;
  };

  const tokenEntries = tokenize(params.query);
  if (tokenEntries.length === 0
    && normalizedTags.length === 0
    && normalizedCategories.length === 0
    && !params.source) {
    for (const skill of Object.values(snapshot.skills)) {
      ensureCandidate(skill.id);
    }
  } else {
    for (const token of tokenEntries) {
      const ids = snapshot.tokens[token];
      if (!ids) {
        continue;
      }
      for (const id of ids) {
        ensureCandidate(id).tokenHits += 1;
      }
    }

    addFacetMatches(snapshot.tags, normalizedTags, ensureCandidate, 'tagMatches');
    addFacetMatches(snapshot.categories, normalizedCategories, ensureCandidate, 'categoryMatches');

    if (params.source) {
      const ids = snapshot.sources[params.source];
      for (const id of ids ?? []) {
        ensureCandidate(id);
      }
    }
  }

  const candidates: RankedSkill[] = rankSkills(
    Array.from(stats.entries()).map(([id, value]) => ({
      id,
      updatedAt: value.updatedAt,
      tokenHits: value.tokenHits,
      tagMatches: value.tagMatches,
      categoryMatches: value.categoryMatches,
    }))
  );

  const filteredCandidates = candidates.filter(matchesFilters);
  const total = filteredCandidates.length;
  const window = filteredCandidates.slice(offset, offset + limit);
  const skills = window
    .map(entry => snapshot.skills[entry.id])
    .filter((skill): skill is CoreSkill => Boolean(skill));

  const result: SearchResult = {
    skills,
    total,
    tookMs: Date.now() - start,
  };
  if (params.includeDebug) {
    result.debug = window;
  }
  return result;

  function matchesFilters(entry: RankedSkill): boolean {
    const skill = snapshot.skills[entry.id];
    if (!skill) {
      return false;
    }
    if (tokenEntries.length > 0 && entry.tokenHits === 0) {
      return false;
    }
    if (normalizedTags.length > 0 && entry.tagMatches === 0) {
      return false;
    }
    if (normalizedCategories.length > 0 && entry.categoryMatches === 0) {
      return false;
    }
    if (params.source && skill.source !== params.source) {
      return false;
    }
    return true;
  }
}

function normalizeFilters(values?: string[]): string[] {
  if (!values?.length) {
    return [];
  }
  return values
    .map(entry => entry?.toLowerCase().trim())
    .filter(Boolean);
}

function addFacetMatches(
  facet: Record<string, string[]>,
  values: string[],
  ensure: (id: string) => CandidateStats,
  field: 'tagMatches' | 'categoryMatches',
): void {
  for (const rawValue of values) {
    const ids = facet[rawValue];
    if (!ids) {
      continue;
    }
    for (const id of ids) {
      ensure(id)[field] += 1;
    }
  }
}
