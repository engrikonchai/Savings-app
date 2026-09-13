import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function ScreenContainer({
  children,
  scroll = false,
  edges = ['top', 'left', 'right', 'bottom'],
  style,
  contentStyle,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.plainContent, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  // Unlike `content` (used as a ScrollView's contentContainerStyle, where
  // flexGrow lets short content stretch), this wraps a plain View that must
  // be clamped to the parent's height — flexGrow alone has no flex-basis to
  // clamp against, so it grows to fit children instead, breaking anything
  // (a nested ScrollView, absolutely-positioned overlays) that relies on a
  // bounded container.
  plainContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
});
