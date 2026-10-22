import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGainMasterStore } from '../store/useGainMasterStore';
import { themeTokens } from '../theme/tokens';
import { GoalType } from '../types/models';

const GOAL_LABELS: Record<GoalType, string> = {
  fat_loss: 'Mục tiêu: Giảm mỡ giữ cơ',
  muscle_gain: 'Mục tiêu: Phát triển cơ bắp',
  weight_gain: 'Mục tiêu: Tăng cân chuẩn',
};

interface HeaderBarProps {
  screenTitle: string;
  subtitle?: string;
}

export function HeaderBar({ screenTitle, subtitle }: HeaderBarProps) {
  const profile = useGainMasterStore((s) => s.profile);
  const setSettingsModalOpen = useGainMasterStore((s) => s.setSettingsModalOpen);

  return (
    <View style={styles.container}>
      <View style={styles.titleBlock}>
        <Text style={styles.screenTitle} accessibilityRole="header">
          {screenTitle}
        </Text>
        <View style={styles.goalRow}>
          <View style={styles.goalPill}>
            <Text style={styles.goalPillText}>{GOAL_LABELS[profile.goal]}</Text>
          </View>
          {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
        </View>
      </View>

      <Pressable
        onPress={() => setSettingsModalOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Mở cài đặt hồ sơ, mục tiêu và chu kỳ chụp ảnh"
        style={({ pressed }) => [styles.gearButton, pressed && styles.gearButtonPressed]}
      >
        <Text style={styles.gearGlyph}>⚙</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: themeTokens.spacing.md,
    paddingTop: themeTokens.spacing.sm,
    paddingBottom: themeTokens.spacing.md,
    backgroundColor: themeTokens.colors.background,
  },
  titleBlock: {
    flex: 1,
    paddingRight: themeTokens.spacing.sm,
  },
  screenTitle: {
    ...themeTokens.typography.largeTitle,
    color: themeTokens.colors.textPrimary,
    marginBottom: 6,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalPill: {
    backgroundColor: themeTokens.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: themeTokens.radii.pill,
    borderWidth: 1,
    borderColor: themeTokens.colors.primary,
  },
  goalPillText: {
    ...themeTokens.typography.small,
    color: themeTokens.colors.primaryDark,
  },
  subtitleText: {
    ...themeTokens.typography.caption,
    color: themeTokens.colors.textSecondary,
  },
  gearButton: {
    minWidth: themeTokens.touchTarget.minSize,
    minHeight: themeTokens.touchTarget.minSize,
    borderRadius: themeTokens.radii.md,
    backgroundColor: themeTokens.colors.surface,
    borderWidth: 1,
    borderColor: themeTokens.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: themeTokens.colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  gearButtonPressed: {
    backgroundColor: themeTokens.colors.surfaceMuted,
  },
  gearGlyph: {
    fontSize: 20,
    color: themeTokens.colors.textPrimary,
  },
});
