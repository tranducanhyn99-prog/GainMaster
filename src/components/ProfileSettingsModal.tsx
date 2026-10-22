import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { calculateBMI } from '../domain/metrics';
import { CYCLE_LABELS_VI } from '../services/progress-checkin';
import { useGainMasterStore } from '../store/useGainMasterStore';
import { themeTokens } from '../theme/tokens';
import { GoalType, PhotoCycleType } from '../types/models';

const GOAL_OPTIONS: { value: GoalType; title: string; desc: string }[] = [
  {
    value: 'fat_loss',
    title: 'Giảm mỡ giữ cơ',
    desc: 'Thâm hụt 450 kcal • Đạm cao 2.1g/kg • Lịch Full Body + Cardio Zone 2',
  },
  {
    value: 'muscle_gain',
    title: 'Phát triển cơ bắp',
    desc: 'Thặng dư sạch +250 kcal • Lịch Upper/Lower hoặc PPL tăng cơ 2×/tuần',
  },
  {
    value: 'weight_gain',
    title: 'Tăng cân cho người gầy',
    desc: 'Thặng dư +450 kcal • Lịch gọn 40–45 phút tránh hao hụt năng lượng',
  },
];

const CYCLE_OPTIONS: PhotoCycleType[] = ['1d', '1w', '1m', '2m'];
const WORKOUT_DAYS_OPTIONS: (3 | 4 | 5 | 6)[] = [3, 4, 5, 6];

export function ProfileSettingsModal() {
  const isOpen = useGainMasterStore((s) => s.isSettingsModalOpen);
  const setOpen = useGainMasterStore((s) => s.setSettingsModalOpen);
  const profile = useGainMasterStore((s) => s.profile);
  const nutritionTargets = useGainMasterStore((s) => s.nutritionTargets);
  const updateProfile = useGainMasterStore((s) => s.updateProfile);

  const [name, setName] = useState(profile.name);
  const [weightText, setWeightText] = useState(String(profile.weightKg));
  const [heightText, setHeightText] = useState(String(profile.heightCm));
  const [ageText, setAgeText] = useState(String(profile.age));
  const [goal, setGoal] = useState<GoalType>(profile.goal);
  const [daysPerWeek, setDaysPerWeek] = useState<3 | 4 | 5 | 6>(profile.workoutDaysPerWeek);
  const [photoCycle, setPhotoCycle] = useState<PhotoCycleType>(profile.photoCycle);
  const [apiKey, setApiKey] = useState(profile.geminiApiKey ?? '');

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setWeightText(String(profile.weightKg));
      setHeightText(String(profile.heightCm));
      setAgeText(String(profile.age));
      setGoal(profile.goal);
      setDaysPerWeek(profile.workoutDaysPerWeek);
      setPhotoCycle(profile.photoCycle);
      setApiKey(profile.geminiApiKey ?? '');
    }
  }, [isOpen, profile]);

  const bmiData = calculateBMI(
    parseFloat(weightText) || profile.weightKg,
    parseFloat(heightText) || profile.heightCm
  );

  const handleSave = () => {
    updateProfile(
      {
        name: name.trim() || 'Người tập',
        weightKg: parseFloat(weightText) || profile.weightKg,
        heightCm: parseFloat(heightText) || profile.heightCm,
        age: parseInt(ageText, 10) || profile.age,
        goal,
        workoutDaysPerWeek: daysPerWeek,
        photoCycle,
        geminiApiKey: apiKey.trim(),
      },
      true
    );
    setOpen(false);
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setOpen(false)}
    >
      <KeyboardAvoidingView
        style={styles.sheetContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetHeader}>
          <Pressable
            onPress={() => setOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Đóng cài đặt hồ sơ"
            style={styles.headerActionBtn}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </Pressable>
          <Text style={styles.sheetTitle} accessibilityRole="header">
            Hồ sơ & Mục tiêu
          </Text>
          <Pressable
            onPress={handleSave}
            accessibilityRole="button"
            accessibilityLabel="Lưu cài đặt hồ sơ và cập nhật lộ trình"
            style={styles.headerActionBtn}
          >
            <Text style={styles.saveText}>Lưu</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody}>
          <View style={styles.summaryBanner}>
            <Text style={styles.summaryTitle}>
              BMI {bmiData.bmi} ({bmiData.category}) • TDEE {nutritionTargets.tdee} kcal
            </Text>
            <Text style={styles.summarySub}>
              Mục tiêu hiện tại: {nutritionTargets.calories} kcal/ngày ({nutritionTargets.proteinGrams}g Đạm •{' '}
              {nutritionTargets.carbsGrams}g Tinh bột • {nutritionTargets.fatGrams}g Béo)
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Chỉ số cơ thể</Text>
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Text style={styles.inputLabel}>Tên hiển thị</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                accessibilityLabel="Tên hiển thị"
                style={styles.textInput}
                placeholder="Nhập tên của bạn"
              />
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metricField}>
                <Text style={styles.inputLabel}>Cân nặng (kg)</Text>
                <TextInput
                  value={weightText}
                  onChangeText={setWeightText}
                  keyboardType="numeric"
                  accessibilityLabel="Cân nặng tính bằng kilogam"
                  style={[styles.textInput, styles.tabularText]}
                />
              </View>
              <View style={styles.metricField}>
                <Text style={styles.inputLabel}>Chiều cao (cm)</Text>
                <TextInput
                  value={heightText}
                  onChangeText={setHeightText}
                  keyboardType="numeric"
                  accessibilityLabel="Chiều cao tính bằng centimet"
                  style={[styles.textInput, styles.tabularText]}
                />
              </View>
              <View style={styles.metricField}>
                <Text style={styles.inputLabel}>Tuổi</Text>
                <TextInput
                  value={ageText}
                  onChangeText={setAgeText}
                  keyboardType="numeric"
                  accessibilityLabel="Số tuổi"
                  style={[styles.textInput, styles.tabularText]}
                />
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Mục tiêu tập luyện & ăn uống</Text>
          <View style={styles.card}>
            {GOAL_OPTIONS.map((opt) => {
              const selected = goal === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setGoal(opt.value)}
                  accessibilityRole="button"
                  accessibilityLabel={`Chọn mục tiêu ${opt.title}`}
                  style={[styles.goalOption, selected && styles.goalOptionSelected]}
                >
                  <View style={styles.goalOptionHeader}>
                    <Text style={[styles.goalOptionTitle, selected && styles.goalOptionTitleSelected]}>
                      {opt.title}
                    </Text>
                    {selected ? <Text style={styles.checkBadge}>Đang chọn</Text> : null}
                  </View>
                  <Text style={styles.goalOptionDesc}>{opt.desc}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Số buổi tập mỗi tuần</Text>
          <View style={styles.pillRow}>
            {WORKOUT_DAYS_OPTIONS.map((d) => {
              const active = daysPerWeek === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDaysPerWeek(d)}
                  accessibilityRole="button"
                  accessibilityLabel={`${d} buổi mỗi tuần`}
                  style={[styles.segmentPill, active && styles.segmentPillActive]}
                >
                  <Text style={[styles.segmentPillText, active && styles.segmentPillTextActive]}>
                    {d} buổi/tuần
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Chu kỳ nhắc chụp & đối chiếu bộ ảnh thể trạng</Text>
          <View style={styles.pillRow}>
            {CYCLE_OPTIONS.map((c) => {
              const active = photoCycle === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setPhotoCycle(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`Chu kỳ chụp ảnh ${CYCLE_LABELS_VI[c]}`}
                  style={[styles.segmentPill, active && styles.segmentPillActive]}
                >
                  <Text style={[styles.segmentPillText, active && styles.segmentPillTextActive]}>
                    {CYCLE_LABELS_VI[c]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionTitle}>Khóa Gemini Vision AI (Tùy chọn)</Text>
          <View style={styles.card}>
            <Text style={styles.helperText}>
              Nhập Gemini API Key để phân tích trực tiếp hình ảnh Mặt trước & Mặt sau bằng Gemini 2.5 Flash. Nếu để trống, ứng dụng tự động dùng bộ phân tích thông minh trên thiết bị.
            </Text>
            <TextInput
              value={apiKey}
              onChangeText={setApiKey}
              accessibilityLabel="Khóa Gemini API Key"
              placeholder="AIzaSy... (Để trống nếu dùng chế độ mặc định)"
              secureTextEntry
              style={styles.textInput}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetContainer: {
    flex: 1,
    backgroundColor: themeTokens.colors.background,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: themeTokens.spacing.md,
    paddingVertical: themeTokens.spacing.sm,
    backgroundColor: themeTokens.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: themeTokens.colors.border,
  },
  headerActionBtn: {
    minWidth: themeTokens.touchTarget.minSize,
    minHeight: themeTokens.touchTarget.minSize,
    justifyContent: 'center',
  },
  cancelText: {
    ...themeTokens.typography.body,
    color: themeTokens.colors.textSecondary,
  },
  saveText: {
    ...themeTokens.typography.body,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
    textAlign: 'right',
  },
  sheetTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.textPrimary,
  },
  scrollBody: {
    padding: themeTokens.spacing.md,
    paddingBottom: 48,
  },
  summaryBanner: {
    backgroundColor: themeTokens.colors.primarySoft,
    borderRadius: themeTokens.radii.md,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
    marginBottom: themeTokens.spacing.lg,
  },
  summaryTitle: {
    ...themeTokens.typography.sectionHeading,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.primaryDark,
    marginBottom: 4,
  },
  summarySub: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textPrimary,
  },
  sectionTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.textPrimary,
    marginTop: themeTokens.spacing.sm,
    marginBottom: themeTokens.spacing.sm,
  },
  card: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    marginBottom: themeTokens.spacing.md,
    gap: 12,
  },
  inputRow: {
    gap: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metricField: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  textInput: {
    minHeight: themeTokens.touchTarget.minSize,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderRadius: themeTokens.radii.sm,
    paddingHorizontal: 12,
    color: themeTokens.colors.textPrimary,
    ...themeTokens.typography.body,
  },
  tabularText: {
    ...themeTokens.typography.tabularNums,
  },
  goalOption: {
    padding: 12,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    minHeight: themeTokens.touchTarget.minSize,
  },
  goalOptionSelected: {
    backgroundColor: themeTokens.colors.primarySoft,
    borderColor: themeTokens.colors.primary,
  },
  goalOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  goalOptionTitle: {
    ...themeTokens.typography.body,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  goalOptionTitleSelected: {
    color: themeTokens.colors.primaryDark,
  },
  checkBadge: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.primaryDark,
  },
  goalOptionDesc: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: themeTokens.spacing.md,
  },
  segmentPill: {
    flex: 1,
    minWidth: 75,
    minHeight: themeTokens.touchTarget.minSize,
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  segmentPillActive: {
    backgroundColor: themeTokens.colors.primary,
    borderColor: themeTokens.colors.primaryDark,
  },
  segmentPillText: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textSecondary,
  },
  segmentPillTextActive: {
    color: themeTokens.colors.surface,
    fontWeight: '700',
  },
  helperText: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
});
