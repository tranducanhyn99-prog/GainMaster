import { calculateBMI, calculateBMR, calculateTDEE, calculateNutritionTargets } from '../metrics';
import { UserProfile } from '../../types/models';

const baseProfile: UserProfile = {
  name: 'Đức Anh',
  gender: 'male',
  age: 25,
  heightCm: 172,
  weightKg: 72,
  activityLevel: 'moderate', // multiplier 1.55
  goal: 'fat_loss',
  workoutDaysPerWeek: 4,
  photoCycle: '1m',
};

describe('Body Metrics & Macro Engine', () => {
  it('computes Mifflin-St Jeor BMR and TDEE accurately', () => {
    // 10*72 + 6.25*172 - 5*25 + 5 = 720 + 1075 - 125 + 5 = 1675
    expect(calculateBMR(baseProfile)).toBe(1675);
    expect(calculateTDEE(baseProfile)).toBe(Math.round(1675 * 1.55)); // 2596
  });

  it('adjusts calories and macros distinctly for fat_loss, muscle_gain, and weight_gain', () => {
    const cut = calculateNutritionTargets({ ...baseProfile, goal: 'fat_loss' });
    const bulk = calculateNutritionTargets({ ...baseProfile, goal: 'muscle_gain' });
    const gain = calculateNutritionTargets({ ...baseProfile, goal: 'weight_gain' });

    expect(cut.calories).toBe(2596 - 450);
    expect(cut.proteinGrams).toBe(Math.round(72 * 2.1)); // high protein preservation
    expect(bulk.calories).toBe(2596 + 250);
    expect(gain.calories).toBe(2596 + 450);
  });

  it('clamps zero, negative, or extreme body stats safely (Review Focus #1)', () => {
    const broken: UserProfile = { ...baseProfile, weightKg: -10, heightCm: 0, age: 0 };
    const targets = calculateNutritionTargets(broken);
    expect(Number.isFinite(targets.calories)).toBe(true);
    expect(targets.calories).toBeGreaterThanOrEqual(1200);
    expect(targets.proteinGrams).toBeGreaterThan(0);
  });
});
