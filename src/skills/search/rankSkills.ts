export interface RankCandidate {
  id: string;
  tokenHits: number;
  tagMatches: number;
  categoryMatches: number;
  updatedAt: string;
}

export interface RankedSkill extends RankCandidate {
  score: number;
}

const WEIGHTS = {
  token: 10,
  tag: 50,
  category: 30,
};

export function rankSkills(candidates: RankCandidate[]): RankedSkill[] {
  return [...candidates]
    .map(candidate => ({
      ...candidate,
      score:
        candidate.tokenHits * WEIGHTS.token +
        candidate.tagMatches * WEIGHTS.tag +
        candidate.categoryMatches * WEIGHTS.category,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      const dateA = new Date(a.updatedAt).getTime();
      const dateB = new Date(b.updatedAt).getTime();
      if (dateB !== dateA) {
        return dateB - dateA;
      }
      return a.id.localeCompare(b.id);
    });
}
