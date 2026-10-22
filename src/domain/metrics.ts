import { ActivityLevelType, MacroTargets, UserProfile } from '../types/models';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevelType, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

function clampNumber(val: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(val)) return fallback;
  return Math.min(max, Math.max(min, val));
}

export function sanitizeProfileInput(profile: UserProfile): UserProfile {
  return {
    ...profile,
    weightKg: clampNumber(profile.weightKg, 30, 250, 65),
    heightCm: clampNumber(profile.heightCm, 120, 230, 170),
    age: Math.round(clampNumber(profile.age, 14, 90, 25)),
  };
}

export function calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string } {
  const safeWeight = clampNumber(weightKg, 30, 250, 65);
  const safeHeightM = clampNumber(heightCm, 120, 230, 170) / 100;
  const bmi = Number((safeWeight / (safeHeightM * safeHeightM)).toFixed(1));

  let category = 'Bình thường';
  if (bmi < 18.5) category = 'Thiếu cân';
  else if (bmi < 23) category = 'Cân đối (Chuẩn châu Á)';
  else if (bmi < 25) category = 'Thừa cân nhẹ';
  else category = 'Thừa cân / Béo phì';

  return { bmi, category };
}

export function calculateBMR(profile: UserProfile): number {
  const safe = sanitizeProfileInput(profile);
  const base = 10 * safe.weightKg + 6.25 * safe.heightCm - 5 * safe.age;
  const genderOffset = safe.gender === 'male' ? 5 : -161;
  return Math.round(base + genderOffset);
}

export function calculateTDEE(profile: UserProfile): number {
  const bmr = calculateBMR(profile);
  const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel] ?? 1.55;
  return Math.round(bmr * multiplier);
}

export function calculateNutritionTargets(profile: UserProfile): MacroTargets {
  const safe = sanitizeProfileInput(profile);
  const bmr = calculateBMR(safe);
  const tdee = calculateTDEE(safe);

  let calorieDelta = 0;
  let proteinPerKg = 1.9;
  let fatRatio = 0.25;

  if (safe.goal === 'fat_loss') {
    calorieDelta = -450;
    proteinPerKg = 2.1; // High protein to preserve lean mass during caloric deficit
    fatRatio = 0.24;
  } else if (safe.goal === 'muscle_gain') {
    calorieDelta = 250; // Controlled lean surplus
    proteinPerKg = 1.95;
    fatRatio = 0.25;
  } else if (safe.goal === 'weight_gain') {
    calorieDelta = 450; // Ectomorph / mass surplus
    proteinPerKg = 1.75;
    fatRatio = 0.28;
  }

  const calories = Math.max(1200, tdee + calorieDelta);
  const proteinGrams = Math.round(safe.weightKg * proteinPerKg);
  const fatGrams = Math.max(35, Math.round((calories * fatRatio) / 9));
  const remainingCalories = Math.max(200, calories - proteinGrams * 4 - fatGrams * 9);
  const carbsGrams = Math.round(remainingCalories / 4);

  return {
    bmr,
    tdee,
    calories,
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
}
