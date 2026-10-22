import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '../../src/components/HeaderBar';
import { EXERCISES } from '../../src/data/exercises';
import { useGainMasterStore } from '../../src/store/useGainMasterStore';
import { themeTokens } from '../../src/theme/tokens';
import { EquipmentType, SessionPhase } from '../../src/types/models';

const PHASE_LABELS_VI: Record<SessionPhase, string> = {
  warmup: 'Giai đoạn 1 • Khởi động & Hiệp làm nóng (Warm-up)',
  primary_compound: 'Giai đoạn 2 • Đa khớp Chủ lực (Primary Compound)',
  secondary_isolation: 'Giai đoạn 3 • Đa khớp Phụ & Cô lập (Hypertrophy)',
  finisher_cooldown: 'Giai đoạn 4 • Core / Cardio & Giãn cơ (Finisher)',
};

const EQUIPMENT_LABELS_VI: Record<EquipmentType, string> = {
  machine: 'Máy tập',
  cable: 'Dây cáp',
  barbell: 'Tạ đòn',
  dumbbell: 'Tạ đơn',
  bodyweight: 'Không cần máy (Bodyweight)',
};

export default function WorkoutScheduleScreen() {
  const weeklySchedule = useGainMasterStore((s) => s.weeklySchedule);
  const applyRecommendedSchedule = useGainMasterStore((s) => s.applyRecommendedSchedule);
  const swapWorkoutDays = useGainMasterStore((s) => s.swapWorkoutDays);
  const toggleWorkoutNoEquipment = useGainMasterStore((s) => s.toggleWorkoutNoEquipment);
  const swapExerciseInDay = useGainMasterStore((s) => s.swapExerciseInDay);
  const addExerciseToDay = useGainMasterStore((s) => s.addExerciseToDay);
  const removeExerciseFromDay = useGainMasterStore((s) => s.removeExerciseFromDay);
  const toggleSetCompleted = useGainMasterStore((s) => s.toggleSetCompleted);

  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [showMoveDayPicker, setShowMoveDayPicker] = useState(false);
  const [showAddExercisePicker, setShowAddExercisePicker] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (restSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setRestSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [restSecondsLeft]);

  const currentSession = weeklySchedule.days[selectedDay] ?? weeklySchedule.days[0];

  const handleCompleteSet = (exerciseInstanceId: string, setIdx: number, restSeconds: number) => {
    toggleSetCompleted(selectedDay, exerciseInstanceId, setIdx);
    setRestSecondsLeft(restSeconds);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HeaderBar
        screenTitle="Lịch tập Khoa học"
        subtitle={weeklySchedule.splitSummaryVi}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Recommended Blueprint Banner & 1-Tap Apply */}
        <View style={styles.blueprintCard}>
          <View style={styles.blueprintTopRow}>
            <Text style={styles.blueprintTitle} accessibilityRole="header">
              {weeklySchedule.isCustomized
                ? 'Lịch tập đã tùy chỉnh theo lịch cá nhân'
                : 'Lịch tập Đề xuất theo Mục tiêu'}
            </Text>
            <Pressable
              onPress={applyRecommendedSchedule}
              accessibilityRole="button"
              accessibilityLabel="Áp dụng ngay lịch tập đề xuất chuẩn khoa học"
              style={styles.applyBtn}
            >
              <Text style={styles.applyBtnText}>Áp dụng đề xuất chuẩn</Text>
            </Pressable>
          </View>
          <Text style={styles.rationaleText}>{weeklySchedule.scienceRationaleVi}</Text>
        </View>

        {/* Active Rest Timer Banner */}
        {restSecondsLeft > 0 ? (
          <View style={styles.timerBanner}>
            <Text style={styles.timerText}>
              Đồng hồ nghỉ giữa hiệp: {restSecondsLeft} giây
            </Text>
            <Pressable
              onPress={() => setRestSecondsLeft(0)}
              accessibilityRole="button"
              accessibilityLabel="Bỏ qua thời gian nghỉ giữa hiệp"
              style={styles.skipTimerBtn}
            >
              <Text style={styles.skipTimerText}>Bỏ qua</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Weekday Selector Row */}
        <View style={styles.dayTabsRow}>
          {weeklySchedule.days.map((day) => {
            const active = selectedDay === day.dayOfWeek;
            return (
              <Pressable
                key={day.dayOfWeek}
                onPress={() => setSelectedDay(day.dayOfWeek)}
                accessibilityRole="button"
                accessibilityLabel={`Chọn ${day.dayLabel} (${day.isRestDay ? 'Nghỉ' : 'Tập'})`}
                style={[
                  styles.dayTab,
                  day.isRestDay && styles.dayTabRest,
                  active && styles.dayTabActive,
                ]}
              >
                <Text style={[styles.dayTabText, active && styles.dayTabTextActive]}>
                  {day.dayLabel.replace('Thứ ', 'T').replace('Chủ Nhật', 'CN')}
                </Text>
                <Text style={[styles.dayStatusDot, active && styles.dayTabTextActive]}>
                  {day.isRestDay ? 'Nghỉ' : 'Tập'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Session Controls: Move Day & Equipment-Free Mode Toggle */}
        <View style={styles.sessionHeaderCard}>
          <Text style={styles.sessionTitle} accessibilityRole="header">
            {currentSession.dayLabel}: {currentSession.sessionTitle}
          </Text>
          <Text style={styles.cardioNote}>{currentSession.cardioNoteVi}</Text>

          <View style={styles.controlsRow}>
            <Pressable
              onPress={() => setShowMoveDayPicker(!showMoveDayPicker)}
              accessibilityRole="button"
              accessibilityLabel="Đổi buổi tập sang ngày khác trong tuần"
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>
                ⇄ Đổi ngày sinh hoạt
              </Text>
            </Pressable>

            {!currentSession.isRestDay ? (
              <Pressable
                onPress={() =>
                  toggleWorkoutNoEquipment(selectedDay, !currentSession.noEquipmentMode)
                }
                accessibilityRole="switch"
                accessibilityLabel="Chuyển toàn bộ buổi tập sang bài tập không cần máy"
                style={[
                  styles.controlButton,
                  currentSession.noEquipmentMode && styles.controlButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.controlButtonText,
                    currentSession.noEquipmentMode && styles.controlButtonTextActive,
                  ]}
                >
                  {currentSession.noEquipmentMode
                    ? '✓ Đang bật: Không cần máy'
                    : 'Chế độ Không có máy'}
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={() => setShowAddExercisePicker(!showAddExercisePicker)}
              accessibilityRole="button"
              accessibilityLabel="Thêm bài tập tùy chọn vào buổi tập này"
              style={styles.controlButton}
            >
              <Text style={styles.controlButtonText}>+ Thêm bài</Text>
            </Pressable>
          </View>

          {/* Move Day Picker */}
          {showMoveDayPicker ? (
            <View style={styles.subPickerBox}>
              <Text style={styles.subPickerLabel}>
                Chọn thứ muốn hoán đổi lịch với {currentSession.dayLabel}:
              </Text>
              <View style={styles.moveDayGrid}>
                {weeklySchedule.days
                  .filter((d) => d.dayOfWeek !== selectedDay)
                  .map((targetDay) => (
                    <Pressable
                      key={targetDay.dayOfWeek}
                      onPress={() => {
                        swapWorkoutDays(selectedDay, targetDay.dayOfWeek);
                        setSelectedDay(targetDay.dayOfWeek);
                        setShowMoveDayPicker(false);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Chuyển buổi tập sang ${targetDay.dayLabel}`}
                      style={styles.moveDayChip}
                    >
                      <Text style={styles.moveDayChipText}>
                        Sang {targetDay.dayLabel}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>
          ) : null}

          {/* Add Custom Exercise Picker */}
          {showAddExercisePicker ? (
            <View style={styles.subPickerBox}>
              <Text style={styles.subPickerLabel}>
                Chọn bài tập từ thư viện để thêm vào buổi tập:
              </Text>
              {EXERCISES.filter((e) => e.phase !== 'warmup')
                .slice(0, 8)
                .map((ex) => (
                  <Pressable
                    key={ex.id}
                    onPress={() => {
                      addExerciseToDay(selectedDay, ex.id);
                      setShowAddExercisePicker(false);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Thêm bài tập ${ex.nameVi}`}
                    style={styles.addExRow}
                  >
                    <Text style={styles.addExName}>{ex.nameVi}</Text>
                    <Text style={styles.addExAction}>+ Thêm</Text>
                  </Pressable>
                ))}
            </View>
          ) : null}
        </View>

        {/* 4-Phase Exercise List */}
        {currentSession.exercises.map((exercise) => (
          <View key={exercise.instanceId} style={styles.exerciseCard}>
            <View style={styles.phaseBanner}>
              <Text style={styles.phaseText}>{PHASE_LABELS_VI[exercise.phase]}</Text>
              <Text style={styles.equipmentBadge}>
                {EQUIPMENT_LABELS_VI[exercise.equipment]}
              </Text>
            </View>

            <Text style={styles.exerciseTitle} accessibilityRole="header">
              {exercise.nameVi}
            </Text>

            <Text style={styles.exercisePrescription}>
              {exercise.sets} hiệp × {exercise.targetReps} • Nghỉ {exercise.restSeconds}s
            </Text>
            <Text style={styles.cueText}>{exercise.cueVi}</Text>

            {/* Working Set Checkboxes */}
            <View style={styles.setsGrid}>
              {exercise.setLogs.map((log, idx) => (
                <Pressable
                  key={log.setNumber}
                  onPress={() =>
                    handleCompleteSet(exercise.instanceId, idx, exercise.restSeconds)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Hiệp ${log.setNumber}: ${log.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}`}
                  style={[styles.setPill, log.completed && styles.setPillCompleted]}
                >
                  <Text
                    style={[
                      styles.setPillText,
                      log.completed && styles.setPillTextCompleted,
                    ]}
                  >
                    {log.completed ? `✓ Hiệp ${log.setNumber}` : `Hiệp ${log.setNumber}`}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Exercise Swap & Remove Actions */}
            <View style={styles.exerciseActionsRow}>
              <Pressable
                onPress={() => swapExerciseInDay(selectedDay, exercise.instanceId, true)}
                accessibilityRole="button"
                accessibilityLabel={`Đổi ${exercise.nameVi} sang bài tập thay thế không cần máy`}
                style={styles.swapEqFreeBtn}
              >
                <Text style={styles.swapEqFreeText}>
                  ↻ Đổi bài Không cần máy / Tạ đơn
                </Text>
              </Pressable>

              <Pressable
                onPress={() => removeExerciseFromDay(selectedDay, exercise.instanceId)}
                accessibilityRole="button"
                accessibilityLabel={`Xóa bài tập ${exercise.nameVi} khỏi buổi tập`}
                style={styles.removeBtn}
              >
                <Text style={styles.removeBtnText}>Xóa bài</Text>
              </Pressable>
            </View>
          </View>
        ))}
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
  blueprintCard: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    gap: 8,
  },
  blueprintTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  blueprintTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.textPrimary,
    flex: 1,
  },
  applyBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.primary,
    justifyContent: 'center',
  },
  applyBtnText: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.surface,
  },
  rationaleText: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  timerBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: themeTokens.colors.coralSoft,
    borderRadius: themeTokens.radii.md,
    paddingHorizontal: themeTokens.spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: themeTokens.colors.coral,
  },
  timerText: {
    ...themeTokens.typography.body,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  skipTimerBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  skipTimerText: {
    ...themeTokens.typography.caption,
    fontWeight: '700',
    color: themeTokens.colors.coral,
  },
  dayTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayTab: {
    flex: 1,
    minHeight: 54,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surface,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  dayTabRest: {
    backgroundColor: themeTokens.colors.surfaceMuted,
  },
  dayTabActive: {
    backgroundColor: themeTokens.colors.primary,
    borderColor: themeTokens.colors.primaryDark,
  },
  dayTabText: {
    ...themeTokens.typography.caption,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  dayStatusDot: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  dayTabTextActive: {
    color: themeTokens.colors.surface,
  },
  sessionHeaderCard: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    gap: 10,
  },
  sessionTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.textPrimary,
  },
  cardioNote: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  controlButton: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    justifyContent: 'center',
  },
  controlButtonActive: {
    backgroundColor: themeTokens.colors.primarySoft,
    borderColor: themeTokens.colors.primary,
  },
  controlButtonText: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  controlButtonTextActive: {
    color: themeTokens.colors.primaryDark,
  },
  subPickerBox: {
    borderTopWidth: 1,
    borderTopColor: themeTokens.colors.border,
    paddingTop: 10,
    gap: 8,
  },
  subPickerLabel: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  moveDayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moveDayChip: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    borderRadius: themeTokens.radii.sm,
    backgroundColor: themeTokens.colors.surfaceMuted,
    justifyContent: 'center',
  },
  moveDayChipText: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  addExRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 10,
    borderRadius: themeTokens.radii.sm,
    backgroundColor: themeTokens.colors.surfaceMuted,
  },
  addExName: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textPrimary,
    flex: 1,
  },
  addExAction: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
  exerciseCard: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    gap: 10,
  },
  phaseBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  phaseText: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.sky,
    fontWeight: '700',
  },
  equipmentBadge: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.primaryDark,
    backgroundColor: themeTokens.colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: themeTokens.radii.pill,
  },
  exerciseTitle: {
    ...themeTokens.typography.body,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  exercisePrescription: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  cueText: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  setsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setPill: {
    minWidth: 82,
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setPillCompleted: {
    backgroundColor: themeTokens.colors.primary,
    borderColor: themeTokens.colors.primaryDark,
  },
  setPillText: {
    ...themeTokens.typography.small,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  setPillTextCompleted: {
    color: themeTokens.colors.surface,
  },
  exerciseActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  swapEqFreeBtn: {
    flex: 1,
    minHeight: themeTokens.touchTarget.minSize,
    borderRadius: themeTokens.radii.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
    backgroundColor: themeTokens.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  swapEqFreeText: {
    ...themeTokens.typography.small,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
  removeBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 12,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.danger,
  },
});
