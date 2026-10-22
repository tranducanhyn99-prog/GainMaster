import { VIETNAMESE_FOODS } from '../data/vietnamese-foods';
import {
  DailyMealPlan,
  MacroTargets,
  MealSlotType,
  PlannedMealSlot,
  VietnameseFoodItem,
} from '../types/models';

const SLOT_CONFIG: { slot: MealSlotType; label: string; calorieShare: number }[] = [
  { slot: 'breakfast', label: 'Bữa sáng', calorieShare: 0.24 },
  { slot: 'lunch', label: 'Bữa trưa', calorieShare: 0.33 },
  { slot: 'dinner', label: 'Bữa tối', calorieShare: 0.28 },
  { slot: 'snack', label: 'Bữa phụ / Trước - Sau tập', calorieShare: 0.15 },
];

function formatScaledHouseholdPortion(baseUnit: string, multiplier: number): string {
  if (Math.abs(multiplier - 1) <= 0.12) {
    return baseUnit;
  }
  const roundedRatio = Math.round(multiplier * 10) / 10;
  return `${baseUnit} (Khẩu phần ×${roundedRatio} theo mục tiêu Calo)`;
}

function buildPlannedMealSlot(
  slot: MealSlotType,
  slotLabel: string,
  food: VietnameseFoodItem,
  targetSlotCalories: number,
  completed = false
): PlannedMealSlot {
  const rawMultiplier = targetSlotCalories / Math.max(100, food.calories);
  const multiplier = Math.min(1.8, Math.max(0.6, rawMultiplier));

  return {
    slot,
    slotLabel,
    foodId: food.id,
    foodName: food.name,
    householdPortion: formatScaledHouseholdPortion(food.householdUnit, multiplier),
    grams: Math.round(food.gramsEquivalent * multiplier),
    calories: Math.round(food.calories * multiplier),
    proteinGrams: Math.round(food.proteinGrams * multiplier),
    carbsGrams: Math.round(food.carbsGrams * multiplier),
    fatGrams: Math.round(food.fatGrams * multiplier),
    completed,
  };
}

function recomputePlanTotals(plan: Omit<DailyMealPlan, 'totalCalories' | 'totalProteinGrams' | 'totalCarbsGrams' | 'totalFatGrams'>): DailyMealPlan {
  const totalCalories = plan.meals.reduce((acc, m) => acc + m.calories, 0);
  const totalProteinGrams = plan.meals.reduce((acc, m) => acc + m.proteinGrams, 0);
  const totalCarbsGrams = plan.meals.reduce((acc, m) => acc + m.carbsGrams, 0);
  const totalFatGrams = plan.meals.reduce((acc, m) => acc + m.fatGrams, 0);

  return {
    ...plan,
    totalCalories,
    totalProteinGrams,
    totalCarbsGrams,
    totalFatGrams,
  };
}

export function generateDailyVietnameseMealPlan(
  targets: MacroTargets,
  dayIndex = 0,
  dateIso = new Date().toISOString().slice(0, 10)
): DailyMealPlan {
  const safeDayIndex = Math.max(0, Math.floor(dayIndex));

  const meals: PlannedMealSlot[] = SLOT_CONFIG.map(({ slot, label, calorieShare }) => {
    const candidates = VIETNAMESE_FOODS.filter((f) => f.suitableSlots.includes(slot));
    const chosen = candidates[safeDayIndex % candidates.length] ?? VIETNAMESE_FOODS[0];
    const targetSlotCalories = Math.round(targets.calories * calorieShare);

    return buildPlannedMealSlot(slot, label, chosen, targetSlotCalories, false);
  });

  return recomputePlanTotals({
    dateIso,
    targetCalories: targets.calories,
    meals,
  });
}

export function swapVietnameseMealItem(
  plan: DailyMealPlan,
  slot: MealSlotType,
  specificFoodId?: string
): DailyMealPlan {
  const currentSlotMeal = plan.meals.find((m) => m.slot === slot);
  if (!currentSlotMeal) return plan;

  const candidates = VIETNAMESE_FOODS.filter((f) => f.suitableSlots.includes(slot));
  if (candidates.length === 0) return plan;

  let nextFood: VietnameseFoodItem | undefined;
  if (specificFoodId) {
    nextFood = candidates.find((f) => f.id === specificFoodId && f.id !== currentSlotMeal.foodId);
  }
  if (!nextFood) {
    const currentIndex = candidates.findIndex((f) => f.id === currentSlotMeal.foodId);
    const nextIndex = (currentIndex + 1) % candidates.length;
    nextFood = candidates[nextIndex];
    if (nextFood.id === currentSlotMeal.foodId && candidates.length > 1) {
      nextFood = candidates[(nextIndex + 1) % candidates.length];
    }
  }

  const updatedMeals = plan.meals.map((meal) => {
    if (meal.slot !== slot) return meal;
    return buildPlannedMealSlot(
      slot,
      meal.slotLabel,
      nextFood!,
      currentSlotMeal.calories,
      meal.completed
    );
  });

  return recomputePlanTotals({
    dateIso: plan.dateIso,
    targetCalories: plan.targetCalories,
    meals: updatedMeals,
  });
}

export function getAlternativesForMealSlot(slot: MealSlotType, excludeFoodId?: string): VietnameseFoodItem[] {
  return VIETNAMESE_FOODS.filter((f) => f.suitableSlots.includes(slot) && f.id !== excludeFoodId);
}

export function calculateConsumedMacros(plan: DailyMealPlan): {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
} {
  return plan.meals
    .filter((m) => m.completed)
    .reduce(
      (acc, m) => ({
        calories: acc.calories + m.calories,
        proteinGrams: acc.proteinGrams + m.proteinGrams,
        carbsGrams: acc.carbsGrams + m.carbsGrams,
        fatGrams: acc.fatGrams + m.fatGrams,
      }),
      { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0 }
    );
}
