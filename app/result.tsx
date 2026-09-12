import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ScreenContainer, Button } from '../src/components';
import { useGoalContext } from '../src/store/GoalContext';
import { formatCurrency } from '../src/utils/currency';
import { TransactionKind } from '../src/types/models';
import { colors, spacing, typography } from '../src/theme';

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    kind: TransactionKind;
    amount: string;
    dayShift: string;
    note?: string;
  }>();
  const router = useRouter();
  const { settings } = useGoalContext();

  const isSaved = params.kind === 'saved';
  const amount = Number(params.amount) || 0;
  const dayShift = Number(params.dayShift) || 0;
  const absShift = Math.abs(dayShift);

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const glow = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSequence(
      withSpring(1.08, { damping: 6, stiffness: 140 }),
      withSpring(1, { damping: 8, stiffness: 160 }),
    );
    glow.value = withSequence(
      withTiming(1, { duration: 350 }),
      withTiming(0.6, { duration: 500 }),
    );
  }, [opacity, scale, glow]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * (isSaved ? 0.5 : 0.32),
    transform: [{ scale: 1 + glow.value * 0.18 }],
  }));

  const accent = isSaved ? colors.accent : colors.spend;
  const iconName: keyof typeof Ionicons.glyphMap = isSaved
    ? absShift > 0
      ? 'rocket'
      : 'checkmark-circle'
    : absShift > 0
      ? 'hourglass'
      : 'trending-down';

  const headline = isSaved
    ? absShift > 0
      ? `You're ${absShift} day${absShift === 1 ? '' : 's'} closer!`
      : "Nice, that's saved!"
    : absShift > 0
      ? `${absShift} day${absShift === 1 ? '' : 's'} farther away`
      : 'Logged that spend';

  const body = isSaved
    ? `Adding ${formatCurrency(amount, settings.currency)} moves your target date closer. Keep the momentum going.`
    : `Spending ${formatCurrency(amount, settings.currency)} pushes your goal back a little. You've got this — bounce back next deposit.`;

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.iconStack}>
        <Animated.View
          pointerEvents="none"
          style={[styles.glow, glowStyle, { backgroundColor: accent }]}
        />
        <Animated.View style={[styles.iconWrap, animatedStyle, { backgroundColor: `${accent}22`, borderColor: `${accent}55` }]}>
          <Ionicons name={iconName} size={52} color={accent} />
        </Animated.View>
      </View>

      <Animated.Text style={[styles.headline, animatedStyle, { color: accent }]}>
        {headline}
      </Animated.Text>
      <Animated.Text style={[styles.body, animatedStyle]}>{body}</Animated.Text>

      <View style={styles.footer}>
        <Button label="Done" onPress={() => router.replace('/(tabs)')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  iconStack: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  iconWrap: {
    width: 124,
    height: 124,
    borderRadius: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  headline: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.lg,
    right: spacing.lg,
  },
});
