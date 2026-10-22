import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '../../src/components/HeaderBar';
import { calculateBMI } from '../../src/domain/metrics';
import { CYCLE_LABELS_VI, isPhotoCheckInDue } from '../../src/services/progress-checkin';
import { useGainMasterStore } from '../../src/store/useGainMasterStore';
import { themeTokens } from '../../src/theme/tokens';

export default function TodayScreen() {
  const router = useRouter();
  const profile = useGainMasterStore((s) => s.profile);
  const targets = useGainMasterStore((s) => s.nutritionTargets);
  const dailyMealPlan = useGainMasterStore((s) => s.dailyMealPlan);
  const weeklySchedule = useGainMasterStore((s) => s.weeklySchedule);
  const checkIns = useGainMasterStore((s) => s.checkIns);
  const getConsumedMacros = useGainMasterStore((s) => s.getConsumedMacros);

  const consumed = getConsumedMacros();
  const bmiInfo = calculateBMI(profile.weightKg, profile.heightCm);
  const photoReminder = isPhotoCheckInDue(checkIns, profile.photoCycle);

  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const todayWorkout = weeklySchedule.days[todayIndex] ?? weeklySchedule.days[0];
  const completedMealsCount = dailyMealPlan.meals.filter((m) => m.completed).length;

  const calorieProgress = Math.min(100, Math.round((consumed.calories / Math.max(1, targets.calories)) * 100));
  const proteinProgress = Math.min(100, Math.round((consumed.proteinGrams / Math.max(1, targets.proteinGrams)) * 100));
  const carbsProgress = Math.min(100, Math.round((consumed.carbsGrams / Math.max(1, targets.carbsGrams)) * 100));
  const fatProgress = Math.min(100, Math.round((consumed.fatGrams / Math.max(1, targets.fatGrams)) * 100));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HeaderBar
        screenTitle={`Chào ${profile.name}`}
        subtitle={`${profile.weightKg} kg • BMI ${bmiInfo.bmi}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Calorie & Macro Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Dinh dưỡng & Năng lượng hôm nay
            </Text>
            <Text style={styles.calorieBadge}>
              {consumed.calories} / {targets.calories} kcal
            </Text>
          </View>

          <View style={styles.calorieTrack}>
            <View style={[styles.calorieFill, { width: `${calorieProgress}%` }]} />
          </View>

          <View style={styles.macroGrid}>
            <View style={styles.macroColumn}>
              <View style={styles.macroLabelRow}>
                <Text style={styles.macroName}>Đạm (Protein)</Text>
                <Text style={[styles.macroValue, { color: themeTokens.colors.primaryDark }]}>
                  {consumed.proteinGrams}/{targets.proteinGrams}g
                </Text>
              </View>
              <View style={styles.macroBarTrack}>
                <View
                  style={[
                    styles.macroBarFill,
                    { width: `${proteinProgress}%`, backgroundColor: themeTokens.colors.primary },
                  ]}
                />
              </View>
            </View>

            <View style={styles.macroColumn}>
              <View style={styles.macroLabelRow}>
                <Text style={styles.macroName}>Tinh bột (Carb)</Text>
                <Text style={[styles.macroValue, { color: themeTokens.colors.sky }]}>
                  {consumed.carbsGrams}/{targets.carbsGrams}g
                </Text>
              </View>
              <View style={styles.macroBarTrack}>
                <View
                  style={[
                    styles.macroBarFill,
                    { width: `${carbsProgress}%`, backgroundColor: themeTokens.colors.sky },
                  ]}
                />
              </View>
            </View>

            <View style={styles.macroColumn}>
              <View style={styles.macroLabelRow}>
                <Text style={styles.macroName}>Chất béo (Fat)</Text>
                <Text style={[styles.macroValue, { color: themeTokens.colors.coral }]}>
                  {consumed.fatGrams}/{targets.fatGrams}g
                </Text>
              </View>
              <View style={styles.macroBarTrack}>
                <View
                  style={[
                    styles.macroBarFill,
                    { width: `${fatProgress}%`, backgroundColor: themeTokens.colors.coral },
                  ]}
                />
              </View>
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/nutrition')}
            accessibilityRole="button"
            accessibilityLabel="Mở thực đơn món Việt hôm nay"
            style={styles.actionRowButton}
          >
            <Text style={styles.actionRowText}>
              Đã dùng {completedMealsCount}/4 bữa thực đơn Việt • Chạm để đánh dấu hoặc đổi món
            </Text>
          </Pressable>
        </View>

        {/* Today's Workout Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Lịch tập hôm nay ({todayWorkout.dayLabel})
            </Text>
            {!todayWorkout.isRestDay ? (
              <Text style={styles.durationBadge}>{todayWorkout.estimatedMinutes} phút</Text>
            ) : null}
          </View>

          <Text style={styles.workoutSessionName}>{todayWorkout.sessionTitle}</Text>
          <Text style={styles.secondaryBody}>{todayWorkout.cardioNoteVi}</Text>

          <Pressable
            onPress={() => router.push('/(tabs)/workout')}
            accessibilityRole="button"
            accessibilityLabel="Mở chi tiết buổi tập hôm nay"
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {todayWorkout.isRestDay
                ? 'Xem lịch tập cả tuần & Đổi ngày linh hoạt'
                : `Bắt đầu buổi tập (${todayWorkout.exercises.length} giai đoạn/bài)`}
            </Text>
          </Pressable>
        </View>

        {/* Periodic Photo Progress Check-in Card */}
        <View style={[styles.card, photoReminder.isDue && styles.reminderCardDue]}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Theo dõi thể trạng & AI ({CYCLE_LABELS_VI[profile.photoCycle]})
            </Text>
            <Text style={styles.cycleTag}>
              {checkIns.length} mốc đã lưu
            </Text>
          </View>

          <Text style={styles.secondaryBody}>
            {photoReminder.isDue
              ? `Đã đến mốc chu kỳ ${CYCLE_LABELS_VI[profile.photoCycle]}. Hãy chụp bộ ảnh Mặt trước & Mặt sau để Gemini Vision AI đánh giá sự thay đổi cơ - mỡ.`
              : `Lần chụp gần nhất cách đây ${photoReminder.daysSinceLast} ngày (còn ${photoReminder.daysRemaining} ngày tới mốc ${CYCLE_LABELS_VI[profile.photoCycle]}).`}
          </Text>

          <Pressable
            onPress={() => router.push('/(tabs)/progress')}
            accessibilityRole="button"
            accessibilityLabel="Mở màn hình đối chiếu bộ ảnh Mặt trước Mặt sau và phân tích AI"
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              Mở bộ ảnh Mặt trước / Mặt sau & Phân tích AI
            </Text>
          </Pressable>
        </View>
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
    paddingBottom: 32,
    gap: themeTokens.spacing.md,
  },
  card: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    shadowColor: themeTokens.colors.textPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    gap: 12,
  },
  reminderCardDue: {
    borderColor: themeTokens.colors.primary,
    backgroundColor: themeTokens.colors.primarySoft,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.textPrimary,
    flex: 1,
  },
  calorieBadge: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
  calorieTrack: {
    height: 10,
    borderRadius: themeTokens.radii.pill,
    backgroundColor: themeTokens.colors.surfaceMuted,
    overflow: 'hidden',
  },
  calorieFill: {
    height: '100%',
    backgroundColor: themeTokens.colors.primary,
    borderRadius: themeTokens.radii.pill,
  },
  macroGrid: {
    gap: 10,
  },
  macroColumn: {
    gap: 4,
  },
  macroLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroName: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  macroValue: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
  },
  macroBarTrack: {
    height: 7,
    borderRadius: themeTokens.radii.pill,
    backgroundColor: themeTokens.colors.surfaceMuted,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: themeTokens.radii.pill,
  },
  actionRowButton: {
    minHeight: themeTokens.touchTarget.minSize,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surfaceMuted,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  actionRowText: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textPrimary,
  },
  durationBadge: {
    ...themeTokens.typography.small,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.sky,
    backgroundColor: themeTokens.colors.skySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: themeTokens.radii.pill,
  },
  workoutSessionName: {
    ...themeTokens.typography.body,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  secondaryBody: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  primaryButton: {
    minHeight: themeTokens.touchTarget.minSize,
    backgroundColor: themeTokens.colors.primary,
    borderRadius: themeTokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    ...themeTokens.typography.caption,
    fontWeight: '700',
    color: themeTokens.colors.surface,
  },
  cycleTag: {
    ...themeTokens.typography.small,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.primaryDark,
  },
  secondaryButton: {
    minHeight: themeTokens.touchTarget.minSize,
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    ...themeTokens.typography.caption,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
});
