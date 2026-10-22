import { findComparisonPairByCycle, isPhotoCheckInDue } from '../progress-checkin';
import { analyzeProgressPhotosWithAI } from '../gemini-vision';
import { BodyCheckInEntry } from '../../types/models';

const mockEntries: BodyCheckInEntry[] = [
  {
    id: 'c1',
    dateIso: '2026-09-20T08:00:00.000Z',
    weightKg: 74.5,
    waistCm: 83,
    frontPhotoUri: 'file:///front-sep.jpg',
    backPhotoUri: 'file:///back-sep.jpg',
  },
  {
    id: 'c2',
    dateIso: '2026-10-14T08:00:00.000Z',
    weightKg: 73.2,
    waistCm: 81.5,
    frontPhotoUri: 'file:///front-oct14.jpg',
    backPhotoUri: 'file:///back-oct14.jpg',
  },
  {
    id: 'c3',
    dateIso: '2026-10-22T08:00:00.000Z',
    weightKg: 72.6,
    waistCm: 80.5,
    frontPhotoUri: 'file:///front-oct22.jpg',
    backPhotoUri: 'file:///back-oct22.jpg',
  },
];

describe('Photo Progress Cycle Matcher & Gemini Vision AI Service', () => {
  it('matches the closest Front/Back photo check-in for 1w and 1m cycles (Review Focus #4)', () => {
    const weekPair = findComparisonPairByCycle(mockEntries, '1w');
    expect(weekPair.latest?.id).toBe('c3');
    expect(weekPair.baseline?.id).toBe('c2'); // 8 days apart, closest to 7d

    const monthPair = findComparisonPairByCycle(mockEntries, '1m');
    expect(monthPair.latest?.id).toBe('c3');
    expect(monthPair.baseline?.id).toBe('c1'); // 32 days apart, closest to 30d
  });

  it('determines when the next periodic photo check-in is due', () => {
    const status = isPhotoCheckInDue(mockEntries, '1w', '2026-10-30T08:00:00.000Z');
    expect(status.isDue).toBe(true);
    expect(status.daysSinceLast).toBe(8);
  });

  it('returns a structured fallback AI assessment when offline or no API key is configured (Review Focus #5)', async () => {
    const report = await analyzeProgressPhotosWithAI({
      baseline: mockEntries[0],
      latest: mockEntries[2],
      goal: 'fat_loss',
      apiKey: '',
    });

    expect(report.source).toBe('fallback');
    expect(report.frontAssessment).toContain('80.5');
    expect(report.backAssessment.length).toBeGreaterThan(10);
    expect(report.bodyFatTrend.length).toBeGreaterThan(5);
    expect(report.coachingRecommendation.length).toBeGreaterThan(10);
  });
});
