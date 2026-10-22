import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '../../src/components/HeaderBar';
import {
  CYCLE_LABELS_VI,
  findComparisonPairByCycle,
} from '../../src/services/progress-checkin';
import { useGainMasterStore } from '../../src/store/useGainMasterStore';
import { themeTokens } from '../../src/theme/tokens';
import { PhotoCycleType } from '../../src/types/models';

const CYCLES: PhotoCycleType[] = ['1d', '1w', '1m', '2m'];

export default function ProgressAIScreen() {
  const profile = useGainMasterStore((s) => s.profile);
  const checkIns = useGainMasterStore((s) => s.checkIns);
  const latestAIReport = useGainMasterStore((s) => s.latestAIReport);
  const updateProfile = useGainMasterStore((s) => s.updateProfile);
  const addBodyCheckIn = useGainMasterStore((s) => s.addBodyCheckIn);
  const runAIComparisonForCycle = useGainMasterStore((s) => s.runAIComparisonForCycle);

  const [selectedCycle, setSelectedCycle] = useState<PhotoCycleType>(profile.photoCycle);
  const [poseView, setPoseView] = useState<'front' | 'back' | 'both'>('both');
  const [compareRatio, setCompareRatio] = useState<number>(50);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New photo check-in form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWeight, setNewWeight] = useState(String(profile.weightKg));
  const [newWaist, setNewWaist] = useState('80.5');
  const [frontUri, setFrontUri] = useState<string>('');
  const [backUri, setBackUri] = useState<string>('');

  const pair = findComparisonPairByCycle(checkIns, selectedCycle);

  const handleSelectCycle = (c: PhotoCycleType) => {
    setSelectedCycle(c);
    updateProfile({ photoCycle: c }, false);
  };

  const handlePickPhoto = async (side: 'front' | 'back', useCamera: boolean) => {
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [3, 4] })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsEditing: true, aspect: [3, 4] });

    if (!result.canceled && result.assets[0]?.uri) {
      if (side === 'front') setFrontUri(result.assets[0].uri);
      else setBackUri(result.assets[0].uri);
    }
  };

  const handleSaveCheckIn = () => {
    addBodyCheckIn({
      dateIso: new Date().toISOString(),
      weightKg: parseFloat(newWeight) || profile.weightKg,
      waistCm: parseFloat(newWaist) || undefined,
      frontPhotoUri: frontUri || 'seed://front_custom',
      backPhotoUri: backUri || 'seed://back_custom',
      notes: `Bộ ảnh chu kỳ ${CYCLE_LABELS_VI[selectedCycle]}`,
    });
    setShowAddForm(false);
    setFrontUri('');
    setBackUri('');
  };

  const handleAnalyzeAI = async () => {
    setIsAnalyzing(true);
    try {
      await runAIComparisonForCycle(selectedCycle);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderPhotoThumb = (uri: string | undefined, label: string) => {
    const isRealImage = uri && (uri.startsWith('file://') || uri.startsWith('http') || uri.startsWith('data:'));
    return (
      <View style={styles.photoFrame}>
        {isRealImage ? (
          <Image source={{ uri }} style={styles.photoImage} resizeMode="cover" />
        ) : (
          <View style={styles.poseSilhouette}>
            <View style={styles.poseGridLineHorizontal} />
            <View style={styles.poseGridLineVertical} />
            <Text style={styles.poseLabel}>{label}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <HeaderBar
        screenTitle="Thể trạng & AI Ảnh"
        subtitle={`Chu kỳ: ${CYCLE_LABELS_VI[selectedCycle]}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cycle Selector */}
        <View style={styles.cycleRow}>
          {CYCLES.map((cycle) => {
            const active = selectedCycle === cycle;
            return (
              <Pressable
                key={cycle}
                onPress={() => handleSelectCycle(cycle)}
                accessibilityRole="button"
                accessibilityLabel={`Đối chiếu theo chu kỳ ${CYCLE_LABELS_VI[cycle]}`}
                style={[styles.cycleButton, active && styles.cycleButtonActive]}
              >
                <Text style={[styles.cycleButtonText, active && styles.cycleButtonTextActive]}>
                  {CYCLE_LABELS_VI[cycle]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Pose Filter & Add Photo Set Button */}
        <View style={styles.toolbarRow}>
          <View style={styles.poseSegmented}>
            {(['both', 'front', 'back'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setPoseView(mode)}
                accessibilityRole="button"
                accessibilityLabel={`Xem góc chụp ${mode === 'both' ? 'Cả hai mặt' : mode === 'front' ? 'Mặt trước' : 'Mặt sau'}`}
                style={[styles.poseChip, poseView === mode && styles.poseChipActive]}
              >
                <Text style={[styles.poseChipText, poseView === mode && styles.poseChipTextActive]}>
                  {mode === 'both' ? 'Trước + Sau' : mode === 'front' ? 'Mặt trước' : 'Mặt sau'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            accessibilityRole="button"
            accessibilityLabel="Thêm bộ ảnh Mặt trước và Mặt sau mới"
            style={styles.addPhotoBtn}
          >
            <Text style={styles.addPhotoBtnText}>
              {showAddForm ? 'Đóng' : '+ Lưu bộ ảnh'}
            </Text>
          </Pressable>
        </View>

        {/* New Check-in Capture Form */}
        {showAddForm ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Lưu bộ ảnh thể trạng mới (Mặt trước & Mặt sau)
            </Text>
            <Text style={styles.helperCopy}>
              Đứng thẳng cách camera 1,5m dưới ánh sáng đều để AI đối chiếu chính xác nhất.
            </Text>

            <View style={styles.inputGrid}>
              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Cân nặng lúc chụp (kg)</Text>
                <TextInput
                  value={newWeight}
                  onChangeText={setNewWeight}
                  keyboardType="numeric"
                  accessibilityLabel="Cân nặng lúc chụp"
                  style={[styles.input, styles.tabular]}
                />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.fieldLabel}>Vòng eo (cm - tùy chọn)</Text>
                <TextInput
                  value={newWaist}
                  onChangeText={setNewWaist}
                  keyboardType="numeric"
                  accessibilityLabel="Số đo vòng eo lúc chụp"
                  style={[styles.input, styles.tabular]}
                />
              </View>
            </View>

            <View style={styles.captureGrid}>
              <View style={styles.captureCol}>
                <Text style={styles.fieldLabel}>1. Ảnh Mặt trước (Front)</Text>
                <Pressable
                  onPress={() => handlePickPhoto('front', true)}
                  accessibilityRole="button"
                  accessibilityLabel="Chụp ảnh Mặt trước bằng Camera"
                  style={styles.captureBtn}
                >
                  <Text style={styles.captureBtnText}>
                    {frontUri ? 'Đã chọn ảnh Mặt trước' : 'Chụp / Chọn Mặt trước'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.captureCol}>
                <Text style={styles.fieldLabel}>2. Ảnh Mặt sau (Back)</Text>
                <Pressable
                  onPress={() => handlePickPhoto('back', true)}
                  accessibilityRole="button"
                  accessibilityLabel="Chụp ảnh Mặt sau bằng Camera"
                  style={styles.captureBtn}
                >
                  <Text style={styles.captureBtnText}>
                    {backUri ? 'Đã chọn ảnh Mặt sau' : 'Chụp / Chọn Mặt sau'}
                  </Text>
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleSaveCheckIn}
              accessibilityRole="button"
              accessibilityLabel="Lưu bộ ảnh vào nhật ký thể trạng"
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Lưu bộ ảnh vào mốc theo dõi</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Side-by-Side Comparison Card */}
        {pair.baseline && pair.latest ? (
          <View style={styles.card}>
            <View style={styles.compareHeader}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Đối chiếu mốc {CYCLE_LABELS_VI[selectedCycle]} ({pair.actualDaysApart} ngày)
              </Text>
              <Text style={styles.weightDeltaBadge}>
                {(pair.latest.weightKg - pair.baseline.weightKg).toFixed(1)} kg
              </Text>
            </View>

            <View style={styles.comparisonColumns}>
              {/* Baseline Milestone */}
              <View
                style={[
                  styles.milestoneColumn,
                  { opacity: Math.max(0.35, (100 - compareRatio * 0.5) / 100) },
                ]}
              >
                <View style={styles.milestoneMeta}>
                  <Text style={styles.milestoneDate}>{pair.baseline.dateIso.slice(0, 10)}</Text>
                  <Text style={styles.milestoneWeight}>{pair.baseline.weightKg} kg</Text>
                </View>
                {poseView !== 'back'
                  ? renderPhotoThumb(pair.baseline.frontPhotoUri, 'Mặt trước (Trước)')
                  : null}
                {poseView !== 'front'
                  ? renderPhotoThumb(pair.baseline.backPhotoUri, 'Mặt sau (Trước)')
                  : null}
              </View>

              {/* Latest Milestone */}
              <View
                style={[
                  styles.milestoneColumn,
                  styles.milestoneColumnLatest,
                  { opacity: Math.max(0.35, (50 + compareRatio * 0.5) / 100) },
                ]}
              >
                <View style={styles.milestoneMeta}>
                  <Text style={[styles.milestoneDate, { color: themeTokens.colors.primaryDark }]}>
                    {pair.latest.dateIso.slice(0, 10)}
                  </Text>
                  <Text style={styles.milestoneWeight}>{pair.latest.weightKg} kg</Text>
                </View>
                {poseView !== 'back'
                  ? renderPhotoThumb(pair.latest.frontPhotoUri, 'Mặt trước (Hiện tại)')
                  : null}
                {poseView !== 'front'
                  ? renderPhotoThumb(pair.latest.backPhotoUri, 'Mặt sau (Hiện tại)')
                  : null}
              </View>
            </View>

            {/* Interactive Comparison Blend Ratio Bar */}
            <View style={styles.sliderSection}>
              <Text style={styles.sliderCaption}>
                Tỷ lệ đối chiếu trực quan Trước ({100 - compareRatio}%) ↔ Sau ({compareRatio}%)
              </Text>
              <View style={styles.ratioButtonRow}>
                {[0, 25, 50, 75, 100].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => setCompareRatio(val)}
                    accessibilityRole="button"
                    accessibilityLabel={`Chỉnh mức đè ảnh ${val} phần trăm`}
                    style={[
                      styles.ratioStepBtn,
                      compareRatio === val && styles.ratioStepBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.ratioStepText,
                        compareRatio === val && styles.ratioStepTextActive,
                      ]}
                    >
                      {val === 0 ? 'Trước' : val === 100 ? 'Hiện tại' : `${val}%`}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              onPress={handleAnalyzeAI}
              disabled={isAnalyzing}
              accessibilityRole="button"
              accessibilityLabel="Phân tích bộ ảnh Mặt trước và Mặt sau bằng AI"
              style={styles.primaryBtn}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={themeTokens.colors.surface} />
              ) : (
                <Text style={styles.primaryBtnText}>
                  Phân tích tiến độ cơ - mỡ bằng Gemini Vision AI
                </Text>
              )}
            </Pressable>
          </View>
        ) : null}

        {/* AI Analysis Result Card */}
        <View style={styles.aiCard}>
          <Text style={styles.aiCardTitle} accessibilityRole="header">
            Nhận xét chuyên môn từ Gemini Vision AI
          </Text>
          {latestAIReport ? (
            <View style={styles.aiReportBody}>
              <View style={styles.aiReportRow}>
                <Text style={styles.aiLabel}>Đánh giá Mặt trước (Front)</Text>
                <Text style={styles.aiCopy}>{latestAIReport.frontAssessment}</Text>
              </View>
              <View style={styles.aiReportRow}>
                <Text style={styles.aiLabel}>Đánh giá Mặt sau (Back)</Text>
                <Text style={styles.aiCopy}>{latestAIReport.backAssessment}</Text>
              </View>
              <View style={styles.aiReportRow}>
                <Text style={styles.aiLabel}>Xu hướng % Mỡ & Cơ bắp</Text>
                <Text style={styles.aiCopy}>{latestAIReport.bodyFatTrend}</Text>
              </View>
              <View style={styles.aiReportRow}>
                <Text style={styles.aiLabel}>Đề xuất điều chỉnh chu kỳ tới</Text>
                <Text style={styles.aiCopy}>{latestAIReport.coachingRecommendation}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.helperCopy}>
              Chạm nút "Phân tích tiến độ cơ - mỡ bằng Gemini Vision AI" phía trên để nhận đánh giá chi tiết từng vùng cơ Mặt trước, Mặt sau và gợi ý điều chỉnh calo/lịch tập.
            </Text>
          )}
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
    paddingBottom: 36,
    gap: themeTokens.spacing.md,
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cycleButton: {
    flex: 1,
    minHeight: themeTokens.touchTarget.minSize,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surface,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleButtonActive: {
    backgroundColor: themeTokens.colors.primary,
    borderColor: themeTokens.colors.primaryDark,
  },
  cycleButtonText: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textSecondary,
  },
  cycleButtonTextActive: {
    color: themeTokens.colors.surface,
    fontWeight: '700',
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  poseSegmented: {
    flexDirection: 'row',
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    padding: 3,
    flex: 1,
  },
  poseChip: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: themeTokens.radii.sm,
  },
  poseChipActive: {
    backgroundColor: themeTokens.colors.surfaceMuted,
  },
  poseChipText: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  poseChipTextActive: {
    color: themeTokens.colors.textPrimary,
    fontWeight: '700',
  },
  addPhotoBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    paddingHorizontal: 14,
    backgroundColor: themeTokens.colors.textPrimary,
    borderRadius: themeTokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoBtnText: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.surface,
    fontWeight: '700',
  },
  card: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    gap: 12,
  },
  sectionTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.textPrimary,
    flex: 1,
  },
  helperCopy: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  inputGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  inputCol: {
    flex: 1,
    gap: 6,
  },
  fieldLabel: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
  },
  input: {
    minHeight: themeTokens.touchTarget.minSize,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderRadius: themeTokens.radii.sm,
    paddingHorizontal: 12,
    color: themeTokens.colors.textPrimary,
    ...themeTokens.typography.body,
  },
  tabular: {
    ...themeTokens.typography.tabularNums,
  },
  captureGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  captureCol: {
    flex: 1,
    gap: 6,
  },
  captureBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    borderRadius: themeTokens.radii.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
    backgroundColor: themeTokens.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  captureBtnText: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.primaryDark,
    fontWeight: '700',
    textAlign: 'center',
  },
  compareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightDeltaBadge: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
    backgroundColor: themeTokens.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: themeTokens.radii.pill,
  },
  comparisonColumns: {
    flexDirection: 'row',
    gap: 10,
  },
  milestoneColumn: {
    flex: 1,
    backgroundColor: themeTokens.colors.surfaceMuted,
    borderRadius: themeTokens.radii.md,
    padding: 10,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    gap: 8,
  },
  milestoneColumnLatest: {
    borderColor: themeTokens.colors.primary,
    backgroundColor: themeTokens.colors.primarySoft,
  },
  milestoneMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneDate: {
    ...themeTokens.typography.small,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textSecondary,
  },
  milestoneWeight: {
    ...themeTokens.typography.caption,
    ...themeTokens.typography.tabularNums,
    fontWeight: '700',
    color: themeTokens.colors.textPrimary,
  },
  photoFrame: {
    height: 112,
    borderRadius: themeTokens.radii.sm,
    backgroundColor: themeTokens.colors.surface,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  poseSilhouette: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  poseGridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: themeTokens.colors.border,
  },
  poseGridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: 1,
    backgroundColor: themeTokens.colors.border,
  },
  poseLabel: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.textSecondary,
    backgroundColor: themeTokens.colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: themeTokens.radii.sm,
  },
  sliderSection: {
    gap: 8,
  },
  sliderCaption: {
    ...themeTokens.typography.small,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textSecondary,
    textAlign: 'center',
  },
  ratioButtonRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ratioStepBtn: {
    flex: 1,
    minHeight: themeTokens.touchTarget.minSize,
    borderRadius: themeTokens.radii.sm,
    backgroundColor: themeTokens.colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratioStepBtnActive: {
    backgroundColor: themeTokens.colors.textPrimary,
  },
  ratioStepText: {
    ...themeTokens.typography.small,
    ...themeTokens.typography.tabularNums,
    color: themeTokens.colors.textSecondary,
  },
  ratioStepTextActive: {
    color: themeTokens.colors.surface,
    fontWeight: '700',
  },
  primaryBtn: {
    minHeight: themeTokens.touchTarget.minSize,
    backgroundColor: themeTokens.colors.primary,
    borderRadius: themeTokens.radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  primaryBtnText: {
    ...themeTokens.typography.caption,
    fontWeight: '700',
    color: themeTokens.colors.surface,
  },
  aiCard: {
    backgroundColor: themeTokens.colors.surface,
    borderRadius: themeTokens.radii.lg,
    padding: themeTokens.spacing.md,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
    gap: 10,
  },
  aiCardTitle: {
    ...themeTokens.typography.sectionHeading,
    color: themeTokens.colors.primaryDark,
  },
  aiReportBody: {
    gap: 10,
  },
  aiReportRow: {
    backgroundColor: themeTokens.colors.primarySoft,
    padding: 12,
    borderRadius: themeTokens.radii.md,
    gap: 4,
  },
  aiLabel: {
    ...themeTokens.typography.caption,
    fontWeight: '700',
    color: themeTokens.colors.primaryDark,
  },
  aiCopy: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textPrimary,
  },
});
