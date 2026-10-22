import { createStore, useStore } from 'zustand';
import { calculateNutritionTargets, sanitizeProfileInput } from '../domain/metrics';
import {
  calculateConsumedMacros,
  generateDailyVietnameseMealPlan,
  swapVietnameseMealItem,
} from '../domain/nutrition';
import {
  addCustomExerciseToSession,
  generateRecommendedWeeklySchedule,
  moveWorkoutSessionDay,
  removeExerciseFromSession,
  swapSessionExercise,
  toggleSessionNoEquipmentMode,
} from '../domain/workout';
import { analyzeProgressPhotosWithAI } from '../services/gemini-vision';
import { findComparisonPairByCycle } from '../services/progress-checkin';
import {
  AIPhysiqueReport,
  BodyCheckInEntry,
  DailyMealPlan,
  MacroTargets,
  MealSlotType,
  PhotoCycleType,
  UserProfile,
  WeeklyWorkoutSchedule,
} from '../types/models';

const INITIAL_PROFILE: UserProfile = {
  name: 'Đức Anh',
  gender: 'male',
  age: 24,
  heightCm: 173,
  weightKg: 73.5,
  activityLevel: 'moderate',
  goal: 'fat_loss',
  workoutDaysPerWeek: 4,
  photoCycle: '1m',
  geminiApiKey: '',
};

const SEED_CHECKINS: BodyCheckInEntry[] = [
  {
    id: 'seed_2m',
    dateIso: '2026-08-22T08:00:00.000Z',
    weightKg: 76.2,
    waistCm: 85.0,
    chestCm: 97.0,
    frontPhotoUri: 'seed://front_aug22',
    backPhotoUri: 'seed://back_aug22',
    notes: 'Mốc khởi điểm bắt đầu theo dõi',
  },
  {
    id: 'seed_1m',
    dateIso: '2026-09-22T08:00:00.000Z',
    weightKg: 74.8,
    waistCm: 83.2,
    chestCm: 98.0,
    frontPhotoUri: 'seed://front_sep22',
    backPhotoUri: 'seed://back_sep22',
    notes: 'Sau 1 tháng ăn thực đơn Việt & tập đều',
  },
  {
    id: 'seed_1w',
    dateIso: '2026-10-15T08:00:00.000Z',
    weightKg: 73.9,
    waistCm: 81.8,
    chestCm: 98.5,
    frontPhotoUri: 'seed://front_oct15',
    backPhotoUri: 'seed://back_oct15',
    notes: 'Tuần trước — giảm mỡ bụng dưới',
  },
  {
    id: 'seed_today',
    dateIso: '2026-10-22T08:00:00.000Z',
    weightKg: 73.5,
    waistCm: 81.0,
    chestCm: 99.0,
    frontPhotoUri: 'seed://front_oct22',
    backPhotoUri: 'seed://back_oct22',
    notes: 'Mốc hiện tại — rãnh lưng và bụng gọn hơn',
  },
];

export interface GainMasterState {
  profile: UserProfile;
  nutritionTargets: MacroTargets;
  dailyMealPlan: DailyMealPlan;
  weeklySchedule: WeeklyWorkoutSchedule;
  checkIns: BodyCheckInEntry[];
  latestAIReport: AIPhysiqueReport | null;
  isSettingsModalOpen: boolean;

  setSettingsModalOpen: (open: boolean) => void;
  updateProfile: (partial: Partial<UserProfile>, regeneratePlans?: boolean) => void;
  applyRecommendedSchedule: () => void;
  swapWorkoutDays: (fromDay: number, toDay: number) => void;
  toggleWorkoutNoEquipment: (dayOfWeek: number, enabled: boolean) => void;
  swapExerciseInDay: (
    dayOfWeek: number,
    exerciseInstanceId: string,
    preferEquipmentFree?: boolean,
    specificReplacementId?: string
  ) => void;
  addExerciseToDay: (dayOfWeek: number, exerciseId: string, sets?: number, reps?: string) => void;
  removeExerciseFromDay: (dayOfWeek: number, exerciseInstanceId: string) => void;
  toggleSetCompleted: (
    dayOfWeek: number,
    exerciseInstanceId: string,
    setIndex: number,
    weightKg?: number,
    repsDone?: number
  ) => void;
  swapMealSlot: (slot: MealSlotType, specificFoodId?: string) => void;
  toggleMealCompleted: (slot: MealSlotType) => void;
  regenerateMealPlanForDay: (dayIndex: number) => void;
  getConsumedMacros: () => {
    calories: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
  addBodyCheckIn: (entry: Omit<BodyCheckInEntry, 'id'>) => BodyCheckInEntry;
  runAIComparisonForCycle: (cycle: PhotoCycleType) => Promise<AIPhysiqueReport | null>;
}

export function createGainMasterStore(initialProfile: UserProfile = INITIAL_PROFILE) {
  const safeProfile = sanitizeProfileInput(initialProfile);
  const initialTargets = calculateNutritionTargets(safeProfile);
  const initialMeals = generateDailyVietnameseMealPlan(initialTargets, 0);
  const initialSchedule = generateRecommendedWeeklySchedule(
    safeProfile.goal,
    safeProfile.workoutDaysPerWeek
  );

  return createStore<GainMasterState>((set, get) => ({
    profile: safeProfile,
    nutritionTargets: initialTargets,
    dailyMealPlan: initialMeals,
    weeklySchedule: initialSchedule,
    checkIns: SEED_CHECKINS,
    latestAIReport: null,
    isSettingsModalOpen: false,

    setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),

    updateProfile: (partial, regeneratePlans = true) => {
      const merged = sanitizeProfileInput({ ...get().profile, ...partial });
      const nextTargets = calculateNutritionTargets(merged);
      const nextMealPlan = regeneratePlans
        ? generateDailyVietnameseMealPlan(nextTargets, 0)
        : get().dailyMealPlan;
      const nextSchedule = regeneratePlans
        ? generateRecommendedWeeklySchedule(merged.goal, merged.workoutDaysPerWeek)
        : get().weeklySchedule;

      set({
        profile: merged,
        nutritionTargets: nextTargets,
        dailyMealPlan: nextMealPlan,
        weeklySchedule: nextSchedule,
      });
    },

    applyRecommendedSchedule: () => {
      const { profile } = get();
      set({
        weeklySchedule: generateRecommendedWeeklySchedule(
          profile.goal,
          profile.workoutDaysPerWeek
        ),
      });
    },

    swapWorkoutDays: (fromDay, toDay) => {
      set({
        weeklySchedule: moveWorkoutSessionDay(get().weeklySchedule, fromDay, toDay),
      });
    },

    toggleWorkoutNoEquipment: (dayOfWeek, enabled) => {
      const schedule = get().weeklySchedule;
      const updatedDays = schedule.days.map((session) =>
        session.dayOfWeek === dayOfWeek
          ? toggleSessionNoEquipmentMode(session, enabled)
          : session
      );
      set({
        weeklySchedule: {
          ...schedule,
          isCustomized: true,
          days: updatedDays,
        },
      });
    },

    swapExerciseInDay: (dayOfWeek, exerciseInstanceId, preferEquipmentFree, specificReplacementId) => {
      const schedule = get().weeklySchedule;
      const updatedDays = schedule.days.map((session) =>
        session.dayOfWeek === dayOfWeek
          ? swapSessionExercise(
              session,
              exerciseInstanceId,
              preferEquipmentFree,
              specificReplacementId
            )
          : session
      );
      set({
        weeklySchedule: {
          ...schedule,
          isCustomized: true,
          days: updatedDays,
        },
      });
    },

    addExerciseToDay: (dayOfWeek, exerciseId, sets = 3, reps = '10-12') => {
      const schedule = get().weeklySchedule;
      const updatedDays = schedule.days.map((session) =>
        session.dayOfWeek === dayOfWeek
          ? addCustomExerciseToSession(session, exerciseId, sets, reps)
          : session
      );
      set({
        weeklySchedule: {
          ...schedule,
          isCustomized: true,
          days: updatedDays,
        },
      });
    },

    removeExerciseFromDay: (dayOfWeek, exerciseInstanceId) => {
      const schedule = get().weeklySchedule;
      const updatedDays = schedule.days.map((session) =>
        session.dayOfWeek === dayOfWeek
          ? removeExerciseFromSession(session, exerciseInstanceId)
          : session
      );
      set({
        weeklySchedule: {
          ...schedule,
          isCustomized: true,
          days: updatedDays,
        },
      });
    },

    toggleSetCompleted: (dayOfWeek, exerciseInstanceId, setIndex, weightKg, repsDone) => {
      const schedule = get().weeklySchedule;
      const updatedDays = schedule.days.map((session) => {
        if (session.dayOfWeek !== dayOfWeek) return session;
        return {
          ...session,
          exercises: session.exercises.map((ex) => {
            if (ex.instanceId !== exerciseInstanceId) return ex;
            return {
              ...ex,
              setLogs: ex.setLogs.map((log, idx) => {
                if (idx !== setIndex) return log;
                return {
                  ...log,
                  weightKg: weightKg !== undefined ? weightKg : log.weightKg,
                  repsDone: repsDone !== undefined ? repsDone : log.repsDone,
                  completed: !log.completed,
                };
              }),
            };
          }),
        };
      });

      set({
        weeklySchedule: {
          ...schedule,
          days: updatedDays,
        },
      });
    },

    swapMealSlot: (slot, specificFoodId) => {
      set({
        dailyMealPlan: swapVietnameseMealItem(get().dailyMealPlan, slot, specificFoodId),
      });
    },

    toggleMealCompleted: (slot) => {
      const plan = get().dailyMealPlan;
      set({
        dailyMealPlan: {
          ...plan,
          meals: plan.meals.map((m) =>
            m.slot === slot ? { ...m, completed: !m.completed } : m
          ),
        },
      });
    },

    regenerateMealPlanForDay: (dayIndex) => {
      set({
        dailyMealPlan: generateDailyVietnameseMealPlan(get().nutritionTargets, dayIndex),
      });
    },

    getConsumedMacros: () => calculateConsumedMacros(get().dailyMealPlan),

    addBodyCheckIn: (entry) => {
      const newEntry: BodyCheckInEntry = {
        ...entry,
        id: `checkin_${Date.now()}`,
      };
      const updatedCheckIns = [...get().checkIns, newEntry];
      set({
        checkIns: updatedCheckIns,
        profile: {
          ...get().profile,
          weightKg: entry.weightKg,
        },
      });
      return newEntry;
    },

    runAIComparisonForCycle: async (cycle) => {
      const { checkIns, profile } = get();
      const pair = findComparisonPairByCycle(checkIns, cycle);
      if (!pair.baseline || !pair.latest) return null;

      const report = await analyzeProgressPhotosWithAI({
        baseline: pair.baseline,
        latest: pair.latest,
        goal: profile.goal,
        cycle,
        apiKey: profile.geminiApiKey,
      });

      set({ latestAIReport: report });
      return report;
    },
  }));
}

export const gainMasterStore = createGainMasterStore();

export function useGainMasterStore<T>(selector: (state: GainMasterState) => T): T {
  return useStore(gainMasterStore, selector);
}
