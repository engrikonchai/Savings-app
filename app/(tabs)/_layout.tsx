import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, TAB_BAR_HEIGHT } from '../../src/theme';

type IconName = keyof typeof Ionicons.glyphMap;

function TabIcon({
  outline,
  filled,
  focused,
}: {
  outline: IconName;
  filled: IconName;
  focused: boolean;
}) {
  return (
    <Ionicons
      name={focused ? filled : outline}
      size={22}
      color={focused ? colors.accentLight : colors.textTertiary}
    />
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accentLight,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.glassBorder,
          height: TAB_BAR_HEIGHT,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon outline="home-outline" filled="home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused }) => (
            <TabIcon outline="time-outline" filled="time" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabIcon outline="settings-outline" filled="settings" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
