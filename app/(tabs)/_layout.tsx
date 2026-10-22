import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { themeTokens } from '../../src/theme/tokens';

export interface TabItemConfig {
  name: 'index' | 'progress' | 'nutrition' | 'workout';
  title: string;
  symbol: string;
}

export const TAB_ITEMS: TabItemConfig[] = [
  { name: 'index', title: 'Hôm nay', symbol: '◉' },
  { name: 'progress', title: 'Thể trạng AI', symbol: '◫' },
  { name: 'nutrition', title: 'Thực đơn', symbol: '♨' },
  { name: 'workout', title: 'Lịch tập', symbol: '◈' },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: themeTokens.colors.primaryDark,
        tabBarInactiveTintColor: themeTokens.colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarAccessibilityLabel: item.title,
            tabBarIcon: ({ color }) => (
              <Text style={[styles.tabIcon, { color }]}>{item.symbol}</Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: themeTokens.colors.surface,
    borderTopColor: themeTokens.colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    ...themeTokens.typography.small,
  },
  tabIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
});
