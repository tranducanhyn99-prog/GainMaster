import { BodyCheckInEntry, PhotoCycleType } from '../types/models';

export const CYCLE_DAYS_MAP: Record<PhotoCycleType, number> = {
  '1d': 1,
  '1w': 7,
  '1m': 30,
  '2m': 60,
};

export const CYCLE_LABELS_VI: Record<PhotoCycleType, string> = {
  '1d': '1 Ngày',
  '1w': '1 Tuần',
  '1m': '1 Tháng',
  '2m': '2 Tháng',
};

function diffDays(earlierIso: string, laterIso: string): number {
  const t1 = new Date(earlierIso).getTime();
  const t2 = new Date(laterIso).getTime();
  if (Number.isNaN(t1) || Number.isNaN(t2)) return 0;
  return Math.max(0, Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));
}

export function sortCheckInsAsc(entries: BodyCheckInEntry[]): BodyCheckInEntry[] {
  return [...entries].sort(
    (a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()
  );
}

export function findComparisonPairByCycle(
  entries: BodyCheckInEntry[],
  cycle: PhotoCycleType
): {
  baseline: BodyCheckInEntry | null;
  latest: BodyCheckInEntry | null;
  targetDays: number;
  actualDaysApart: number;
} {
  const targetDays = CYCLE_DAYS_MAP[cycle] ?? 30;
  if (entries.length === 0) {
    return { baseline: null, latest: null, targetDays, actualDaysApart: 0 };
  }

  const sorted = sortCheckInsAsc(entries);
  const latest = sorted[sorted.length - 1];

  if (sorted.length === 1) {
    return { baseline: null, latest, targetDays, actualDaysApart: 0 };
  }

  const candidates = sorted.slice(0, sorted.length - 1);
  let bestBaseline = candidates[0];
  let bestDeltaScore = Math.abs(diffDays(bestBaseline.dateIso, latest.dateIso) - targetDays);

  for (const candidate of candidates) {
    const daysApart = diffDays(candidate.dateIso, latest.dateIso);
    const deltaScore = Math.abs(daysApart - targetDays);
    if (deltaScore < bestDeltaScore) {
      bestBaseline = candidate;
      bestDeltaScore = deltaScore;
    }
  }

  return {
    baseline: bestBaseline,
    latest,
    targetDays,
    actualDaysApart: diffDays(bestBaseline.dateIso, latest.dateIso),
  };
}

export function isPhotoCheckInDue(
  entries: BodyCheckInEntry[],
  cycle: PhotoCycleType,
  nowIso = new Date().toISOString()
): { isDue: boolean; daysSinceLast: number; daysRemaining: number } {
  const targetDays = CYCLE_DAYS_MAP[cycle] ?? 30;
  if (entries.length === 0) {
    return { isDue: true, daysSinceLast: targetDays, daysRemaining: 0 };
  }

  const sorted = sortCheckInsAsc(entries);
  const latest = sorted[sorted.length - 1];
  const daysSinceLast = diffDays(latest.dateIso, nowIso);
  const isDue = daysSinceLast >= targetDays;
  const daysRemaining = Math.max(0, targetDays - daysSinceLast);

  return { isDue, daysSinceLast, daysRemaining };
}
