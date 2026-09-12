import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSequence(
      withSpring(1.08, { damping: 6, stiffness: 140 }),
      withSpring(1, { damping: 8, stiffness: 160 }),
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const accent = isSaved ? colors.accentLight : colors.spend;
  const emoji = isSaved ? (absShift > 0 ? '🚀' : '💪') : absShift > 0 ? '⏳' : '📉';

  const headline = isSaved
    ? absShift > 0
      ? `${absShift} day${absShift === 1 ? '' : 's'} closer!`
      : "Nice, that's saved!"
    : absShift > 0
      ? `${absShift} day${absShift === 1 ? '' : 's'} farther away`
      : 'Logged that spend';

  const body = isSaved
    ? `Adding ${formatCurrency(amount, settings.currency)} moves your target date closer. Keep the momentum going.`
    : `Spending ${formatCurrency(amount, settings.currency)} pushes your goal back a little. You've got this — bounce back next deposit.`;

  return (
    <ScreenContainer contentStyle={styles.content}>
      <Animated.View style={[styles.iconWrap, animatedStyle, { backgroundColor: `${accent}22` }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>

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
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 56,
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
