# GainMaster (iOS-First Virtual PT) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build GainMaster, an iOS-first React Native (Expo) virtual personal trainer app for solo gym-goers featuring body analysis, periodic Front/Back photo comparison with Gemini Vision AI, a Vietnamese meal planner with everyday units, and an evidence-based goal-specific workout scheduler with equipment-free alternatives.

**Architecture:** Local-first Expo (React Native + TypeScript + Expo Router) application structured into pure domain engines (`metrics`, `nutrition`, `workout`, `progress-checkin`), a persisted state store (`AsyncStorage` + `expo-file-system`), and a 4-tab iOS interface with a global top-right settings sheet (`⚙️`). UI/UX follows Style B (Clean Daylight) governed by the `impeccable` design system (`PRODUCT.md`, `DESIGN.md`, `Operate` mode).

**Tech Stack:** Expo SDK 52+ (React Native, TypeScript, Expo Router), Zustand + AsyncStorage (local persistence), `expo-image-picker` & `expo-file-system` (local Front/Back photo storage), Google Gemini API (`gemini-2.5-flash` via REST/SDK for multi-image vision analysis), Jest + `ts-jest` (unit/integration testing).

**Spec:** `docs/superpowers/specs/2026-10-22-gainmaster-design.md`

## Global Constraints

- **Target Platform:** iOS-first via React Native (Expo) developed on Windows; must run in Expo Go on physical iPhone and Expo Web on Windows.
- **Navigation Layout:** Exactly 4 bottom tabs (`Hôm nay`, `Thể trạng AI`, `Thực đơn`, `Lịch tập`) plus a persistent top-right gear button (`⚙️`) opening the Profile, Goal & Photo Cycle Modal Sheet.
- **Visual Direction & Craft:** Style B — Clean Daylight (`#F6F5F2` Alabaster background, `#FFFFFF` card surface, `#E2E8F0` border, `#10B981` Emerald primary accent, `#0EA5E9` Sky carb/workout accent, `#F97316` Coral fat/energy accent, `#0F172A` slate ink, `tabular-nums` on all numeric metrics), verified with the `impeccable` skill (`PRODUCT.md`, `DESIGN.md`, `craft-floor.md`).
- **Privacy & Local-First:** All profile data, workout logs, meal logs, and Front/Back physique photos stay on the user's device by default; photos are transmitted only when the user explicitly triggers Gemini Vision AI analysis.
- **Language & Units:** All user-facing copy in natural Vietnamese; Vietnamese dishes measured in everyday units (`bát`, `tô`, `lạng (100g)`, `quả`, `đĩa`, `hộp`, `củ`) alongside gram/kcal/macro values.

## Review Focus

1. **Unrealistic or zero/negative body stats entered in Profile Settings:** `calculateNutritionTargets` must clamp or reject invalid height/weight/age inputs (`weightKg <= 25`, `heightCm <= 100`, `age <= 10`) instead of producing negative BMR/TDEE or `NaN` macro targets.
2. **Swapping a Vietnamese dish when only a few items exist in that meal slot:** `swapVietnameseMealItem` must exclude the currently selected dish, scale portion multipliers so the replacement stays within `±15%` of the slot's target kcal, and never return `undefined`.
3. **Switching a workout session to "Không có máy (Equipment-Free)" after the user already customized exercises or logged sets:** `toggleSessionNoEquipmentMode` must swap machine/cable exercises to their bodyweight/dumbbell equivalents while preserving completed set logs and user-added exercises.
4. **Selecting a photo comparison cycle (`1d`, `1w`, `1m`, `2m`) when no check-in exists at that exact historical date:** `findComparisonPairByCycle` must select the closest check-in near the target interval (or gracefully fall back to the earliest available check-in when only 2 entries exist, and return `null` comparison when `< 2` entries exist).
5. **Triggering AI photo analysis without an internet connection or without a configured Gemini API key:** `analyzeProgressPhotosWithAI` must catch network/missing-key errors and return a structured deterministic fallback assessment (`source: 'fallback'`) computed from weight/measurement deltas so the UI never crashes or hangs.

---

## File Structure

- `PRODUCT.md` — Durable product context for `impeccable` (`Operate` mode, iOS-first solo gym virtual PT).
- `DESIGN.md` — Design system tokens and rules for Style B (Clean Daylight) per `impeccable`.
- `src/theme/tokens.ts` — Typed design tokens matching `DESIGN.md` (colors, spacing, radii, typography, tabular numerals).
- `src/types/models.ts` — Shared TypeScript interfaces for UserProfile, GoalType, MacroTargets, VietnameseFoodItem, DailyMealPlan, ExerciseItem, WorkoutSessionPlan, WeeklyWorkoutSchedule, BodyCheckInEntry, and AIPhysiqueReport.
- `src/domain/metrics.ts` — Pure functions for BMI, Mifflin-St Jeor BMR, TDEE, and goal-based Calorie/Macro calculations (`fat_loss`, `muscle_gain`, `weight_gain`).
- `src/data/vietnamese-foods.ts` — Seed database of 40+ authentic Vietnamese foods & dishes with everyday household units (`bát`, `tô`, `lạng`, `quả`, `đĩa`) and macro profiles.
- `src/domain/nutrition.ts` — Daily Vietnamese meal plan generator, 1-tap equivalent food swapper, and daily consumed macro aggregator.
- `src/data/exercises.ts` — Seed database of exercises across 4 session phases with explicit machine vs. free-weight vs. bodyweight (`equipmentFree`) alternatives.
- `src/domain/workout.ts` — Evidence-based workout split generator (`fat_loss`, `muscle_gain`, `weight_gain`), 4-phase session builder, custom schedule day swapper, custom exercise editor, and equipment-free session converter.
- `src/services/progress-checkin.ts` — Cycle comparison matcher (`1d`, `1w`, `1m`, `2m`) and local photo check-in manager.
- `src/services/gemini-vision.ts` — Gemini 2.5 Flash Vision API client for Front/Back photo pair comparison + deterministic smart fallback.
- `src/store/useGainMasterStore.ts` — Persisted Zustand store connecting profile, nutrition, workout schedule, and photo check-ins.
- `src/components/HeaderBar.tsx` — Top iOS header with goal badge, greeting, and `⚙️` button.
- `src/components/ProfileSettingsModal.tsx` — Modal sheet for editing body stats, Goal (`Giảm mỡ`, `Tăng cơ`, `Tăng cân`), workout days/week, photo reminder cycle (`1 ngày`, `1 tuần`, `1 tháng`, `2 tháng`), and optional Gemini API key.
- `app/_layout.tsx` — Root Expo Router provider and modal host.
- `app/(tabs)/_layout.tsx` — 4-Tab iOS bottom navigation bar (`Hôm nay`, `Thể trạng AI`, `Thực đơn`, `Lịch tập`).
- `app/(tabs)/index.tsx` — Screen 1: `Hôm nay` (Calorie ring, Macro bars, Today's workout summary, Photo check-in reminder).
- `app/(tabs)/progress.tsx` — Screen 2: `Thể trạng AI` (Cycle selector, Front/Back photo uploader with pose alignment grid, Side-by-Side & Before/After slider, Gemini Vision AI report card).
- `app/(tabs)/nutrition.tsx` — Screen 3: `Thực đơn` (4 Vietnamese meal slots, household units, 1-tap "Đổi món", meal completion check).
- `app/(tabs)/workout.tsx` — Screen 4: `Lịch tập` (Recommended blueprint banner with "Áp dụng ngay", weekday rearrange controls, 4-phase exercise list, "Chế độ Không có máy" toggle, 1-tap exercise swap, set logger & Rest Timer).

---

### Task 1: Project Scaffolding, Core Types & Impeccable Design System (`PRODUCT.md`, `DESIGN.md`, `tokens.ts`)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `jest.config.js`
- Create: `app.json`
- Create: `PRODUCT.md`
- Create: `DESIGN.md`
- Create: `src/types/models.ts`
- Create: `src/theme/tokens.ts`
- Test: `src/theme/__tests__/tokens.test.ts`

**Interfaces:**
- Produces:
  - `GoalType = 'fat_loss' | 'muscle_gain' | 'weight_gain'`
  - `PhotoCycleType = '1d' | '1w' | '1m' | '2m'`
  - `EquipmentType = 'machine' | 'cable' | 'barbell' | 'dumbbell' | 'bodyweight'`
  - `SessionPhase = 'warmup' | 'primary_compound' | 'secondary_isolation' | 'finisher_cooldown'`
  - `themeTokens` in `src/theme/tokens.ts` (`colors.background = '#F6F5F2'`, `colors.surface = '#FFFFFF'`, `colors.primary = '#10B981'`, `colors.sky = '#0EA5E9'`, `colors.coral = '#F97316'`, `colors.textPrimary = '#0F172A'`)

- [ ] **Step 1: Write the failing test in `src/theme/__tests__/tokens.test.ts`**

```typescript
import { themeTokens } from '../tokens';

describe('Clean Daylight (Style B) Impeccable Design Tokens', () => {
  it('pins the exact Style B palette and tabular numeral rules from the spec', () => {
    expect(themeTokens.colors.background).toBe('#F6F5F2');
    expect(themeTokens.colors.surface).toBe('#FFFFFF');
    expect(themeTokens.colors.border).toBe('#E2E8F0');
    expect(themeTokens.colors.primary).toBe('#10B981');
    expect(themeTokens.colors.sky).toBe('#0EA5E9');
    expect(themeTokens.colors.coral).toBe('#F97316');
    expect(themeTokens.colors.textPrimary).toBe('#0F172A');
    expect(themeTokens.typography.tabularNums.fontVariant).toContain('tabular-nums');
  });
});
```

- [ ] **Step 2: Set up `package.json`, `tsconfig.json`, `jest.config.js`, and run test to verify it fails**

Run: `npx jest src/theme/__tests__/tokens.test.ts`
Expected: FAIL with `Cannot find module '../tokens'`

- [ ] **Step 3: Create `PRODUCT.md`, `DESIGN.md`, `src/types/models.ts`, and `src/theme/tokens.ts`**

Document Style B (Clean Daylight) in `PRODUCT.md` and `DESIGN.md` following `impeccable` (`Operate` mode, iOS native ergonomics), define all shared domain interfaces in `src/types/models.ts`, and export `themeTokens` in `src/theme/tokens.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/theme/__tests__/tokens.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json jest.config.js app.json PRODUCT.md DESIGN.md src/types/models.ts src/theme/tokens.ts src/theme/__tests__/tokens.test.ts
git commit -m "chore: scaffold Expo TypeScript setup, domain types, and Impeccable Style B design tokens"
```

---

### Task 2: Body Metrics & Goal Calorie/Macro Engine (`src/domain/metrics.ts`)

**Files:**
- Create: `src/domain/metrics.ts`
- Test: `src/domain/__tests__/metrics.test.ts`

**Interfaces:**
- Consumes: `UserProfile`, `GoalType`, `MacroTargets` from `src/types/models.ts`
- Produces:
  - `sanitizeProfileInput(profile: UserProfile): UserProfile`
  - `calculateBMI(weightKg: number, heightCm: number): { bmi: number; category: string }`
  - `calculateBMR(profile: UserProfile): number`
  - `calculateTDEE(profile: UserProfile): number`
  - `calculateNutritionTargets(profile: UserProfile): MacroTargets`

- [ ] **Step 1: Write the failing test in `src/domain/__tests__/metrics.test.ts`**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/domain/__tests__/metrics.test.ts`
Expected: FAIL with `Cannot find module '../metrics'`

- [ ] **Step 3: Implement `src/domain/metrics.ts`**

Implement `sanitizeProfileInput` (clamping `weightKg` to `[30, 250]`, `heightCm` to `[120, 230]`, `age` to `[14, 90]`), `calculateBMI`, `calculateBMR` (Mifflin-St Jeor), `calculateTDEE`, and `calculateNutritionTargets` with a 1200 kcal safety floor.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/domain/__tests__/metrics.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/domain/metrics.ts src/domain/__tests__/metrics.test.ts
git commit -m "feat(metrics): add Mifflin-St Jeor BMR/TDEE and goal-based macro calculator"
```

---

### Task 3: Authentic Vietnamese Nutrition Engine & Equivalent Food Swapper (`src/domain/nutrition.ts`)

**Files:**
- Create: `src/data/vietnamese-foods.ts`
- Create: `src/domain/nutrition.ts`
- Test: `src/domain/__tests__/nutrition.test.ts`

**Interfaces:**
- Consumes: `MacroTargets`, `VietnameseFoodItem`, `DailyMealPlan`, `MealSlotType` from `src/types/models.ts`
- Produces:
  - `VIETNAMESE_FOODS: VietnameseFoodItem[]` (at least 36 authentic Vietnamese items across `breakfast`, `lunch`, `dinner`, `snack`, with `householdUnit` like `'1 tô vừa'`, `'1.5 bát cơm + 1.5 lạng ức gà'`, `'2 quả'`, `'1 củ vừa'`)
  - `generateDailyVietnameseMealPlan(targets: MacroTargets, dayIndex?: number): DailyMealPlan`
  - `swapVietnameseMealItem(plan: DailyMealPlan, slot: MealSlotType): DailyMealPlan`
  - `calculateConsumedMacros(plan: DailyMealPlan): { calories: number; proteinGrams: number; carbsGrams: number; fatGrams: number }`

- [ ] **Step 1: Write the failing test in `src/domain/__tests__/nutrition.test.ts`**

```typescript
import { VIETNAMESE_FOODS } from '../../data/vietnamese-foods';
import {
  generateDailyVietnameseMealPlan,
  swapVietnameseMealItem,
  calculateConsumedMacros,
} from '../nutrition';

describe('Vietnamese Meal Planner & Swapper', () => {
  const sampleTargets = {
    bmr: 1675,
    tdee: 2596,
    calories: 2100,
    proteinGrams: 150,
    carbsGrams: 210,
    fatGrams: 60,
  };

  it('contains authentic Vietnamese dishes with familiar household units', () => {
    expect(VIETNAMESE_FOODS.length).toBeGreaterThanOrEqual(36);
    expect(VIETNAMESE_FOODS.some((f) => f.name.includes('Phở bò'))).toBe(true);
    expect(VIETNAMESE_FOODS.some((f) => f.householdUnit.includes('bát') || f.householdUnit.includes('lạng'))).toBe(true);
  });

  it('generates a 4-meal daily plan matching target calories within 10%', () => {
    const plan = generateDailyVietnameseMealPlan(sampleTargets, 0);
    expect(plan.meals).toHaveLength(4);
    expect(Math.abs(plan.totalCalories - sampleTargets.calories)).toBeLessThanOrEqual(sampleTargets.calories * 0.1);
  });

  it('swaps a dish in a meal slot for a different Vietnamese dish with equivalent calories (Review Focus #2)', () => {
    const plan = generateDailyVietnameseMealPlan(sampleTargets, 0);
    const originalBreakfast = plan.meals.find((m) => m.slot === 'breakfast')!;
    const swappedPlan = swapVietnameseMealItem(plan, 'breakfast');
    const newBreakfast = swappedPlan.meals.find((m) => m.slot === 'breakfast')!;

    expect(newBreakfast.foodId).not.toBe(originalBreakfast.foodId);
    expect(Math.abs(newBreakfast.calories - originalBreakfast.calories)).toBeLessThanOrEqual(
      originalBreakfast.calories * 0.15
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/domain/__tests__/nutrition.test.ts`
Expected: FAIL with `Cannot find module '../../data/vietnamese-foods'`

- [ ] **Step 3: Implement `src/data/vietnamese-foods.ts` and `src/domain/nutrition.ts`**

Create the Vietnamese food database (Phở bò tái nạm, Bún bò Huế, Bún chả Hà Nội, Cơm tấm sườn nướng, Khoai lang mật luộc + Trứng gà luộc, Cơm trắng + Ức gà áp chảo sả ớt + Rau muống luộc, Cơm gạo lứt + Thăn bò xào bông cải, Cá hồi/cá basa áp chảo, Đậu phụ nhồi thịt sốt cà chua, Thịt thăn heo luộc, Sữa chua không đường + Chuối tiêu, Sữa đậu nành ít đường...) and implement portion-scaled plan generation, equivalent meal swapping, and macro summing.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/domain/__tests__/nutrition.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/vietnamese-foods.ts src/domain/nutrition.ts src/domain/__tests__/nutrition.test.ts
git commit -m "feat(nutrition): add Vietnamese food library with household units and 1-tap meal swapper"
```

---

### Task 4: Evidence-Based Goal Workout Engine, Schedule Customizer & Equipment-Free Alternatives (`src/domain/workout.ts`)

**Files:**
- Create: `src/data/exercises.ts`
- Create: `src/domain/workout.ts`
- Test: `src/domain/__tests__/workout.test.ts`

**Interfaces:**
- Consumes: `GoalType`, `ExerciseItem`, `WorkoutSessionPlan`, `WeeklyWorkoutSchedule` from `src/types/models.ts`
- Produces:
  - `EXERCISES: ExerciseItem[]`
  - `generateRecommendedWeeklySchedule(goal: GoalType, daysPerWeek: number): WeeklyWorkoutSchedule`
  - `moveWorkoutSessionDay(schedule: WeeklyWorkoutSchedule, fromDayOfWeek: number, toDayOfWeek: number): WeeklyWorkoutSchedule`
  - `swapSessionExercise(session: WorkoutSessionPlan, exerciseInstanceId: string, preferEquipmentFree?: boolean): WorkoutSessionPlan`
  - `toggleSessionNoEquipmentMode(session: WorkoutSessionPlan, enabled: boolean): WorkoutSessionPlan`
  - `addCustomExerciseToSession(session: WorkoutSessionPlan, exerciseId: string, sets: number, reps: string): WorkoutSessionPlan`
  - `removeExerciseFromSession(session: WorkoutSessionPlan, exerciseInstanceId: string): WorkoutSessionPlan`

- [ ] **Step 1: Write the failing test in `src/domain/__tests__/workout.test.ts`**

```typescript
import {
  generateRecommendedWeeklySchedule,
  moveWorkoutSessionDay,
  swapSessionExercise,
  toggleSessionNoEquipmentMode,
} from '../workout';

describe('Evidence-Based Goal Workout Engine & Customizer', () => {
  it('structures 4-phase sessions differently for fat_loss, muscle_gain, and weight_gain', () => {
    const fatLoss = generateRecommendedWeeklySchedule('fat_loss', 3);
    const hypertrophy = generateRecommendedWeeklySchedule('muscle_gain', 4);
    const ectomorph = generateRecommendedWeeklySchedule('weight_gain', 4);

    const flSession = fatLoss.days.find((d) => !d.isRestDay)!;
    const hypSession = hypertrophy.days.find((d) => !d.isRestDay)!;
    const ectoSession = ectomorph.days.find((d) => !d.isRestDay)!;

    // Every training session has all 4 physiological phases
    const phases = new Set(flSession.exercises.map((e) => e.phase));
    expect(phases.has('warmup')).toBe(true);
    expect(phases.has('primary_compound')).toBe(true);
    expect(phases.has('secondary_isolation')).toBe(true);
    expect(phases.has('finisher_cooldown')).toBe(true);

    // Fat loss includes Zone 2 / conditioning finisher; Ectomorph weight_gain excludes calorie-burning cardio
    expect(flSession.cardioFinisherMinutes).toBeGreaterThanOrEqual(15);
    expect(ectoSession.cardioFinisherMinutes).toBe(0);
    expect(hypSession.splitName).toContain('Upper / Lower');
  });

  it('allows the user to move a workout day to fit their personal schedule', () => {
    const schedule = generateRecommendedWeeklySchedule('muscle_gain', 4);
    // Move Thursday (dayIndex 3) to Saturday (dayIndex 5)
    const updated = moveWorkoutSessionDay(schedule, 3, 5);
    expect(updated.days[5].isRestDay).toBe(false);
    expect(updated.days[3].isRestDay).toBe(true);
    expect(updated.isCustomized).toBe(true);
  });

  it('converts machine exercises to equipment-free alternatives while preserving completed set logs (Review Focus #3)', () => {
    const schedule = generateRecommendedWeeklySchedule('muscle_gain', 4);
    const session = schedule.days.find((d) => !d.isRestDay)!;
    session.exercises[1].setLogs[0].completed = true;
    session.exercises[1].setLogs[0].weightKg = 60;

    const noEquipSession = toggleSessionNoEquipmentMode(session, true);
    const workingExercises = noEquipSession.exercises.filter((e) => e.phase !== 'warmup');
    expect(workingExercises.every((e) => ['bodyweight', 'dumbbell', 'barbell'].includes(e.equipment))).toBe(true);
    expect(noEquipSession.exercises[1].setLogs[0].completed).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/domain/__tests__/workout.test.ts`
Expected: FAIL with `Cannot find module '../workout'`

- [ ] **Step 3: Implement `src/data/exercises.ts` and `src/domain/workout.ts`**

Populate `src/data/exercises.ts` with exercises across all muscle groups, tagging each with `phase`, `equipment` (`machine`, `cable`, `barbell`, `dumbbell`, `bodyweight`), and explicit `equipmentFreeAlternativeIds` (e.g. Chest Press Machine ➔ Push-ups / Decline Push-ups / Dumbbell Press; Lat Pulldown ➔ Pull-ups / Chin-ups / Dumbbell Row; Leg Press / Leg Extension ➔ Bulgarian Split Squat / Bodyweight Squat / Lunges; Seated Leg Curl ➔ Romanian Deadlift / Glute Bridge; Cable Pushdown ➔ Diamond Push-ups / Bench Dips). Implement the 4-phase session builder, goal-specific programming (`fat_loss`, `muscle_gain`, `weight_gain`), day swapping, exercise editing, and equipment-free mode conversion.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/domain/__tests__/workout.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/exercises.ts src/domain/workout.ts src/domain/__tests__/workout.test.ts
git commit -m "feat(workout): add evidence-based goal splits, 4-phase session builder, and equipment-free alternatives"
```

---

### Task 5: Body Progress Photo Check-in Service & Gemini Vision AI Analyzer (`src/services/progress-checkin.ts`, `src/services/gemini-vision.ts`)

**Files:**
- Create: `src/services/progress-checkin.ts`
- Create: `src/services/gemini-vision.ts`
- Test: `src/services/__tests__/progress-checkin.test.ts`

**Interfaces:**
- Consumes: `BodyCheckInEntry`, `PhotoCycleType`, `GoalType`, `AIPhysiqueReport` from `src/types/models.ts`
- Produces:
  - `CYCLE_DAYS_MAP: Record<PhotoCycleType, number>` (`1d: 1, 1w: 7, 1m: 30, 2m: 60`)
  - `findComparisonPairByCycle(entries: BodyCheckInEntry[], cycle: PhotoCycleType): { baseline: BodyCheckInEntry | null; latest: BodyCheckInEntry | null; targetDays: number; actualDaysApart: number }`
  - `isPhotoCheckInDue(entries: BodyCheckInEntry[], cycle: PhotoCycleType, nowIso?: string): { isDue: boolean; daysSinceLast: number; daysRemaining: number }`
  - `analyzeProgressPhotosWithAI(params: { baseline: BodyCheckInEntry; latest: BodyCheckInEntry; goal: GoalType; apiKey?: string; fetchImpl?: typeof fetch }): Promise<AIPhysiqueReport>`

- [ ] **Step 1: Write the failing test in `src/services/__tests__/progress-checkin.test.ts`**

```typescript
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/services/__tests__/progress-checkin.test.ts`
Expected: FAIL with `Cannot find module '../progress-checkin'`

- [ ] **Step 3: Implement `src/services/progress-checkin.ts` and `src/services/gemini-vision.ts`**

Implement cycle date matching (`1d`, `1w`, `1m`, `2m`), reminder due calculation, and `analyzeProgressPhotosWithAI` which calls Gemini `gemini-2.5-flash` with a Vietnamese bodybuilding coach prompt requesting JSON (`frontAssessment`, `backAssessment`, `bodyFatTrend`, `coachingRecommendation`) and falls back deterministically when offline or when `apiKey` is omitted.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/services/__tests__/progress-checkin.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/progress-checkin.ts src/services/gemini-vision.ts src/services/__tests__/progress-checkin.test.ts
git commit -m "feat(progress-ai): add Front/Back photo cycle matcher and Gemini Vision AI analyzer with smart fallback"
```

---

### Task 6: Local-First Persisted Store (`src/store/useGainMasterStore.ts`)

**Files:**
- Create: `src/store/useGainMasterStore.ts`
- Test: `src/store/__tests__/useGainMasterStore.test.ts`

**Interfaces:**
- Consumes: Domain functions from Tasks 2, 3, 4, 5
- Produces:
  - `useGainMasterStore` hook & store actions:
    - `updateProfile(partial: Partial<UserProfile>, regeneratePlans?: boolean): void`
    - `applyRecommendedSchedule(): void`
    - `swapWorkoutDays(fromDay: number, toDay: number): void`
    - `toggleWorkoutNoEquipment(dayOfWeek: number, enabled: boolean): void`
    - `swapExerciseInDay(dayOfWeek: number, exerciseInstanceId: string): void`
    - `toggleSetCompleted(dayOfWeek: number, exerciseInstanceId: string, setIndex: number, weightKg?: number, repsDone?: number): void`
    - `swapMealSlot(slot: MealSlotType): void`
    - `toggleMealCompleted(slot: MealSlotType): void`
    - `addBodyCheckIn(entry: Omit<BodyCheckInEntry, 'id'>): BodyCheckInEntry`
    - `runAIComparisonForCycle(cycle: PhotoCycleType): Promise<AIPhysiqueReport | null>`

- [ ] **Step 1: Write the failing test in `src/store/__tests__/useGainMasterStore.test.ts`**

```typescript
import { createGainMasterStore } from '../useGainMasterStore';

describe('GainMaster Unified Store', () => {
  it('recomputes macro targets and updates recommended schedule when goal changes in ⚙️ Settings', () => {
    const store = createGainMasterStore();
    expect(store.getState().profile.goal).toBe('fat_loss');

    store.getState().updateProfile({ goal: 'muscle_gain', workoutDaysPerWeek: 4 }, true);
    const state = store.getState();

    expect(state.profile.goal).toBe('muscle_gain');
    expect(state.nutritionTargets.calories).toBeGreaterThan(state.nutritionTargets.tdee);
    expect(state.weeklySchedule.goal).toBe('muscle_gain');
  });

  it('tracks meal completion and updates consumed macros on the Today dashboard', () => {
    const store = createGainMasterStore();
    store.getState().toggleMealCompleted('breakfast');
    const consumed = store.getState().getConsumedMacros();
    expect(consumed.calories).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/store/__tests__/useGainMasterStore.test.ts`
Expected: FAIL with `Cannot find module '../useGainMasterStore'`

- [ ] **Step 3: Implement `src/store/useGainMasterStore.ts`**

Implement the Zustand store with initial seed check-ins (so the user can test 1-week and 1-month Front/Back comparisons immediately on first launch while also adding their own live iPhone camera photos), connecting all domain actions cleanly.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest src/store/__tests__/useGainMasterStore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/store/useGainMasterStore.ts src/store/__tests__/useGainMasterStore.test.ts
git commit -m "feat(store): implement local-first persisted state store for profile, meals, workouts, and AI photo check-ins"
```

---

### Task 7: Impeccable Style B iOS Screens, 4-Tab Navigation & Settings Modal (`app/` & `src/components/`)

**Files:**
- Create: `src/components/HeaderBar.tsx`
- Create: `src/components/ProfileSettingsModal.tsx`
- Create: `app/_layout.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/progress.tsx`
- Create: `app/(tabs)/nutrition.tsx`
- Create: `app/(tabs)/workout.tsx`
- Test: `src/components/__tests__/navigation-config.test.ts`

**Interfaces:**
- Consumes: `useGainMasterStore` from Task 6, `themeTokens` from Task 1
- Produces:
  - `TAB_CONFIG` in `app/(tabs)/_layout.tsx` (4 tabs: `index` Hôm nay, `progress` Thể trạng AI, `nutrition` Thực đơn, `workout` Lịch tập)
  - Complete iOS screens styled in Style B (Clean Daylight) audited against `impeccable` (`craft-floor.md`, `audit.native.md`, `polish.md`)

- [ ] **Step 1: Write the failing test in `src/components/__tests__/navigation-config.test.ts`**

```typescript
import { TAB_ITEMS } from '../../../app/(tabs)/_layout';

describe('4-Tab iOS Navigation Structure', () => {
  it('exposes exactly the 4 approved tabs in order', () => {
    expect(TAB_ITEMS.map((t) => t.name)).toEqual(['index', 'progress', 'nutrition', 'workout']);
    expect(TAB_ITEMS.map((t) => t.title)).toEqual(['Hôm nay', 'Thể trạng AI', 'Thực đơn', 'Lịch tập']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest src/components/__tests__/navigation-config.test.ts`
Expected: FAIL with `Cannot find module '../../../app/(tabs)/_layout'`

- [ ] **Step 3: Implement `HeaderBar`, `ProfileSettingsModal`, and the 4 Tab Screens following `impeccable` Style B**

Build:
1. `HeaderBar.tsx` & `ProfileSettingsModal.tsx`: Top-right `⚙️` gear button opening the iOS sheet to edit body metrics, switch Goal (`Giảm mỡ`, `Tăng cơ`, `Tăng cân`), choose workout frequency (`3–6 buổi/tuần`), configure photo check-in cycle (`1 ngày`, `1 tuần`, `1 tháng`, `2 tháng`), and enter optional Gemini API Key.
2. `app/(tabs)/index.tsx` (`Hôm nay`): SVG/Clean Daylight Calorie Ring + Protein/Carb/Fat progress bars (`tabular-nums`), Today's Workout quick card, and Photo Check-in cycle reminder card.
3. `app/(tabs)/progress.tsx` (`Thể trạng AI`): Cycle pill tabs (`1 Ngày`, `1 Tuần`, `1 Tháng`, `2 Tháng`), Front & Back photo capture/picker with pose alignment overlay, Side-by-Side & interactive Before/After comparison view, and Gemini Vision AI 4-part analysis card.
4. `app/(tabs)/nutrition.tsx` (`Thực đơn`): 4 Vietnamese meal cards with household units (`bát`, `tô`, `lạng`, `quả`), 1-tap `↻ Đổi món tương đương` modal/action, and `Đã ăn` completion toggle.
5. `app/(tabs)/workout.tsx` (`Lịch tập`): Recommended Blueprint banner with `Áp dụng ngay`, weekday swapper to fit personal life schedule, `Chế độ Không có máy (Tập tại nhà / Tạ tự do)` 1-tap toggle, 4-phase session cards (`Khởi động` ➔ `Đa khớp chủ lực` ➔ `Đa khớp phụ & Cô lập` ➔ `Core / Cardio & Giãn cơ`), 1-tap alternative exercise picker, set weight/rep logger, and countdown Rest Timer.

- [ ] **Step 4: Run full Jest test suite and TypeScript compiler verification**

Run: `npx jest && npx tsc --noEmit`
Expected: PASS (all test suites green, 0 TypeScript errors)

- [ ] **Step 5: Commit**

```bash
git add src/components/ app/
git commit -m "feat(ui): build 4-tab Clean Daylight iOS interface with Impeccable craft and ⚙️ settings sheet"
```
