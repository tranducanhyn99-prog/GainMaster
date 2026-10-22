import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '../../src/components/HeaderBar';
import { getAlternativesForMealSlot } from '../../src/domain/nutrition';
import { useGainMasterStore } from '../../src/store/useGainMasterStore';
import { themeTokens } from '../../src/theme/tokens';
import { MealSlotType } from '../../src/types/models';

export default function VietnameseNutritionScreen() {
  const dailyMealPlan = useGainMasterStore((s) => s.dailyMealPlan);
  const targets = useGainMasterStore((s) => s.nutritionTargets);
  const swapMealSlot = useGainMasterStore((s) => s.swapMealSlot);
  const toggleMealCompleted = useGainMasterStore((s) => s.toggleMealCompleted);
  const regenerateMealPlanForDay = useGainMasterStore((s) => s.regenerateMealPlanForDay);

  const [expandedSwapSlot, setExpandedSwapSlot] = useState<MealSlotType | null>(null);
  const [menuVariantIndex, setMenuVariantIndex] = useState(0);

  const handleNextDayMenu = () => {
    const nextIdx = menuVariantIndex + 1;
    setMenuVariantIndex(nextIdx);
    regenerateMealPlanForDay(nextIdx);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HeaderBar
        screenTitle="Thực đơn Thuần Việt"
        subtitle={`Mục tiêu: ${targets.calories} kcal/ngày`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Macro Summary Banner */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryTitle} accessibilityRole="header">
              Tổng thực đơn hôm nay: {dailyMealPlan.totalCalories} kcal
            </Text>
            <Pressable
              onPress={handleNextDayMenu}
              accessibilityRole="button"
              accessibilityLabel="Đổi sang thực đơn mẫu ngày tiếp theo"
              style={styles.refreshMenuBtn}
            >
              <Text style={styles.refreshMenuText}>Đổi thực đơn mẫu khác</Text>
            </Pressable>
          </View>

          <View style={styles.macroPillRow}>
            <View style={styles.macroPill}>
              <Text style={styles.macroPillLabel}>Đạm (Protein)</Text>
              <Text style={[styles.macroPillValue, { color: themeTokens.colors.primaryDark }]}>
                {dailyMealPlan.totalProteinGrams}g / {targets.proteinGrams}g
              </Text>
            </View>
            <View style={styles.macroPill}>
              <Text style={styles.macroPillLabel}>Tinh bột (Carb)</Text>
              <Text style={[styles.macroPillValue, { color: themeTokens.colors.sky }]}>
                {dailyMealPlan.totalCarbsGrams}g / {targets.carbsGrams}g
              </Text>
            </View>
            <View style={styles.macroPill}>
              <Text style={styles.macroPillLabel}>Chất béo (Fat)</Text>
              <Text style={[styles.macroPillValue, { color: themeTokens.colors.coral }]}>
                {dailyMealPlan.totalFatGrams}g / {targets.fatGrams}g
              </Text>
            </View>
          </View>
        </View>

        {/* 4 Vietnamese Meal Slots */}
        {dailyMealPlan.meals.map((meal) => {
          const isPickerOpen = expandedSwapSlot === meal.slot;
          const alternatives = isPickerOpen
            ? getAlternativesForMealSlot(meal.slot, meal.foodId)
            : [];

          return (
            <View
              key={meal.slot}
              style={[styles.mealCard, meal.completed && styles.mealCardCompleted]}
            >
              <View style={styles.mealHeaderRow}>
                <Text style={styles.slotTitle} accessibilityRole="header">
                  {meal.slotLabel}
                </Text>
                <Text style={styles.mealKcal}>
                  {meal.calories} kcal • {meal.proteinGrams}g Đạm
                </Text>
              </View>

              <Text style={styles.dishName}>{meal.foodName}</Text>

              <View style={styles.portionBox}>
                <Text style={styles.portionText}>
                  Định lượng: {meal.householdPortion} (~{meal.grams}g)
                </Text>
                <Text style={styles.macroDetailText}>
                  Đạm {meal.proteinGrams}g • Tinh bột {meal.carbsGrams}g • Béo {meal.fatGrams}g
                </Text>
              </View>

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() => toggleMealCompleted(meal.slot)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    meal.completed
                      ? `Bỏ đánh dấu đã ăn ${meal.slotLabel}`
                      : `Đánh dấu đã ăn ${meal.slotLabel}`
                  }
                  style={[
                    styles.completeBtn,
                    meal.completed && styles.completeBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.completeBtnText,
                      meal.completed && styles.completeBtnTextActive,
                    ]}
                  >
                    {meal.completed ? '✓ Đã ăn bữa này' : 'Đánh dấu Đã ăn'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => swapMealSlot(meal.slot)}
                  accessibilityRole="button"
                  accessibilityLabel={`Đổi nhanh món tương đương cho ${meal.slotLabel}`}
                  style={styles.quickSwapBtn}
                >
                  <Text style={styles.quickSwapText}>↻ Đổi nhanh</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    setExpandedSwapSlot(isPickerOpen ? null : meal.slot)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Chọn món Việt cụ thể cho ${meal.slotLabel}`}
                  style={styles.chooseDishBtn}
                >
                  <Text style={styles.chooseDishText}>
                    {isPickerOpen ? 'Ẩn danh sách' : 'Chọn món'}
                  </Text>
                </Pressable>
              </View>

              {isPickerOpen ? (
                <View style={styles.alternativesContainer}>
                  <Text style={styles.alternativesHeader}>
                    Chọn món Việt thay thế (Tự động cân đối khẩu phần ~{meal.calories} kcal):
                  </Text>
                  {alternatives.map((alt) => (
                    <Pressable
                      key={alt.id}
                      onPress={() => {
                        swapMealSlot(meal.slot, alt.id);
                        setExpandedSwapSlot(null);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Đổi sang món ${alt.name}`}
                      style={styles.altOptionRow}
                    >
                      <View style={styles.altInfo}>
                        <Text style={styles.altName}>{alt.name}</Text>
                        <Text style={styles.altUnit}>{alt.householdUnit}</Text>
                      </View>
                      <Text style={styles.altSelectLabel}>Chọn</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: themeTokens.colors.background,
  },
  scrollContent: {
    paddingHorizontal: themeTokens.spacing.md,
    paddingBottom: 36,
    gap: themeTokens.spacing.md,
  },
  summaryCard: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    gap: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  summaryTitle: {
    ...themeTokens.typography.sectionHeading,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textPrimary,
    flex: 1,
  },
  refreshMenuBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.primarySoft,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
    justifyContent: 'center',
  },
  refreshMenuText: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.primaryDark,
    fontWeight: '700',
  },
  macroPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  macroPill: {
    flex: 1,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderRadius: themeTokens.radii.md,
    padding: 10,
    gap: 2,
  },
  macroPillLabel: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  macroPillValue: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
  },
  mealCard: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    gap: 10,
  },
  mealCardCompleted: {
    borderColor: themeTokens.colors.primary,
    backgroundColor: themeTokens.colors.primarySoft,
  },
  mealHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.textPrimary,
  },
  mealKcal: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
  dishName: {
    ...themeTokens.typography.body,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  portionBox: {
    backgroundColor: themeTokens.colors.surfaceMuted,
    padding: 10,
    borderRadius: themeTokens.radii.md,
    gap: 3,
  },
  portionText: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textPrimary,
  },
  macroDetailText: {
    ...themeTokens.typography.small,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  completeBtn: {
    flex: 1,
    minHeight: themeTokens.touchTarget.minSize,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  completeBtnActive: {
    backgroundColor: themeTokens.colors.primary,
    borderColor: themeTokens.colors.primaryDark,
  },
  completeBtnText: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  completeBtnTextActive: {
    color: themeTokens.colors.surface,
  },
  quickSwapBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surface,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickSwapText: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
  chooseDishBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 10,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chooseDishText: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  alternativesContainer: {
    borderTopWidth: 1,
    borderTopColor: themeTokens.colors.border,
    paddingTop: 10,
    gap: 8,
  },
  alternativesHeader: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  altOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: themeTokens.touchTarget.minSize,
    padding: 10,
    borderRadius: themeTokens.radii.sm,
    backgroundColor: themeTokens.colors.surfaceMuted,
  },
  altInfo: {
    flex: 1,
    paddingRight: 8,
  },
  altName: {
    ...themeTokens.typography.caption,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  altUnit: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  altSelectLabel: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
});
