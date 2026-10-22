export type GoalType = 'fat_loss' | 'muscle_gain' | 'weight_gain';

export type GenderType = 'male' | 'female';

export type ActivityLevelType = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export type PhotoCycleType = '1d' | '1w' | '1m' | '2m';

export type MealSlotType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type EquipmentType = 'machine' | 'cable' | 'barbell' | 'dumbbell' | 'bodyweight';

export type SessionPhase = 'warmup' | 'primary_compound' | 'secondary_isolation' | 'finisher_cooldown';

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'quads'
  | 'hamstrings_glutes'
  | 'arms'
  | 'core'
  | 'full_body';

export interface UserProfile {
  name: string;
  gender: GenderType;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevelType;
  goal: GoalType;
  workoutDaysPerWeek: 3 | 4 | 5 | 6;
  photoCycle: PhotoCycleType;
  geminiApiKey?: string;
}

export interface MacroTargets {
  bmr: number;
  tdee: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface VietnameseFoodItem {
  id: string;
  name: string;
  category: 'home_cooked' | 'street_familiar';
  suitableSlots: MealSlotType[];
  householdUnit: string;
  gramsEquivalent: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  tags: string[];
}

export interface PlannedMealSlot {
  slot: MealSlotType;
  slotLabel: string;
  foodId: string;
  foodName: string;
  householdPortion: string;
  grams: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  completed: boolean;
}

export interface DailyMealPlan {
  dateIso: string;
  targetCalories: number;
  meals: PlannedMealSlot[];
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatGrams: number;
}

export interface ExerciseItem {
  id: string;
  nameVi: string;
  nameEn: string;
  muscleGroup: MuscleGroup;
  phase: SessionPhase;
  equipment: EquipmentType;
  defaultSets: number;
  repRangeByGoal: Record<GoalType, string>;
  restSecondsByGoal: Record<GoalType, number>;
  cueVi: string;
  alternativeIds: string[];
  equipmentFreeAlternativeIds: string[];
}

export interface WorkoutSetLog {
  setNumber: number;
  weightKg: number;
  repsDone: number;
  completed: boolean;
}

export interface PlannedSessionExercise {
  instanceId: string;
  exerciseId: string;
  nameVi: string;
  nameEn: string;
  muscleGroup: MuscleGroup;
  phase: SessionPhase;
  equipment: EquipmentType;
  sets: number;
  targetReps: string;
  restSeconds: number;
  cueVi: string;
  setLogs: WorkoutSetLog[];
}

export interface WorkoutSessionPlan {
  dayOfWeek: number; // 0 = Monday ... 6 = Sunday
  dayLabel: string;
  goal?: GoalType;
  isRestDay: boolean;
  sessionTitle: string;
  splitName: string;
  estimatedMinutes: number;
  noEquipmentMode: boolean;
  cardioFinisherMinutes: number;
  cardioNoteVi: string;
  exercises: PlannedSessionExercise[];
}

export interface WeeklyWorkoutSchedule {
  goal: GoalType;
  daysPerWeek: number;
  splitSummaryVi: string;
  scienceRationaleVi: string;
  isCustomized: boolean;
  days: WorkoutSessionPlan[];
}

export interface AIPhysiqueReport {
  generatedAtIso: string;
  cycle: PhotoCycleType;
  source: 'gemini' | 'fallback';
  frontAssessment: string;
  backAssessment: string;
  bodyFatTrend: string;
  coachingRecommendation: string;
}

export interface BodyCheckInEntry {
  id: string;
  dateIso: string;
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  hipCm?: number;
  frontPhotoUri: string;
  backPhotoUri: string;
  notes?: string;
  aiReport?: AIPhysiqueReport;
}
