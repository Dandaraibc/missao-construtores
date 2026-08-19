import { TeamProgress, TeamSlug, CollectiveProgress } from "@/types";
import { teams } from "@/data/teams";

const STORAGE_KEY = "missao-construtores-progress";

export function getAllProgress(): Record<TeamSlug, TeamProgress> {
  if (typeof window === "undefined") return getDefaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    return JSON.parse(raw);
  } catch {
    return getDefaultProgress();
  }
}

function getDefaultProgress(): Record<TeamSlug, TeamProgress> {
  const result = {} as Record<TeamSlug, TeamProgress>;
  for (const team of teams) {
    result[team.slug] = {
      teamSlug: team.slug,
      completedMissions: [],
      answers: {},
      xp: 0,
      badges: [],
      lastUpdated: new Date().toISOString(),
    };
  }
  return result;
}

export function getTeamProgress(slug: TeamSlug): TeamProgress {
  const all = getAllProgress();
  return all[slug] || getDefaultProgress()[slug];
}

export function saveTeamProgress(progress: TeamProgress) {
  const all = getAllProgress();
  all[progress.teamSlug] = {
    ...progress,
    lastUpdated: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function completeMission(
  teamSlug: TeamSlug,
  missionId: string,
  answers: Record<string, any>,
  xpReward: number,
  badge?: string
) {
  const progress = getTeamProgress(teamSlug);
  if (!progress.completedMissions.includes(missionId)) {
    progress.completedMissions.push(missionId);
    progress.xp += xpReward;
    if (badge && !progress.badges.includes(badge)) {
      progress.badges.push(badge);
    }
  }
  progress.answers[missionId] = answers;
  saveTeamProgress(progress);
  return progress;
}

export function getCollectiveProgress(): CollectiveProgress {
  const all = getAllProgress();
  const result: CollectiveProgress = {
    pesquisa: 0,
    produto: 0,
    design: 0,
    testes: 0,
    comunicacao: 0,
  };

  for (const team of teams) {
    const progress = all[team.slug];
    const total = team.missions.length;
    const completed = progress?.completedMissions.length || 0;
    result[team.slug] = total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  return result;
}

export function getOverallProgress(): number {
  const c = getCollectiveProgress();
  const values = Object.values(c);
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function exportAllData() {
  return {
    exportedAt: new Date().toISOString(),
    progress: getAllProgress(),
    collective: getCollectiveProgress(),
  };
}
