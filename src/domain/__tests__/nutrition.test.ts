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

  it('sums consumed macros accurately when meals are marked completed', () => {
    const plan = generateDailyVietnameseMealPlan(sampleTargets, 0);
    plan.meals[0].completed = true;
    const consumed = calculateConsumedMacros(plan);
    expect(consumed.calories).toBe(plan.meals[0].calories);
    expect(consumed.proteinGrams).toBe(plan.meals[0].proteinGrams);
  });
});
