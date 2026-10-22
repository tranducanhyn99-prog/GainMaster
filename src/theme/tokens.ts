export const themeTokens = {
  colors: {
    background: '#F6F5F2',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    border: '#E2E8F0',
    primary: '#10B981',
    primaryDark: '#059669',
    primarySoft: '#ECFDF5',
    sky: '#0EA5E9',
    skySoft: '#E0F2FE',
    coral: '#F97316',
    coralSoft: '#FFEDD5',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#64748B',
    danger: '#EF4444',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
  },
  radii: {
    sm: 10,
    md: 14,
    lg: 20,
    pill: 999,
  },
  touchTarget: {
    minSize: 44,
  },
  typography: {
    largeTitle: {
      fontSize: 26,
      fontWeight: '800' as const,
      letterSpacing: -0.5,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
    },
    sectionHeading: {
      fontSize: 16,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 15,
      fontWeight: '500' as const,
      lineHeight: 22,
    },
    caption: {
      fontSize: 13,
      fontWeight: '600' as const,
      lineHeight: 18,
    },
    small: {
      fontSize: 11.5,
      fontWeight: '600' as const,
    },
    tabularNums: {
      fontVariant: ['tabular-nums'] as ('tabular-nums')[],
    },
  },
};
