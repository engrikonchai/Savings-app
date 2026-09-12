import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ScreenContainer, Card, Button, ProgressRing, StatTile } from '../../src/components';
import { useGoalContext } from '../../src/store/GoalContext';
import { calculateGoalProgress } from '../../src/utils/goalMath';
import { formatCurrency } from '../../src/utils/currency';
import { formatDateShort } from '../../src/utils/date';
import { getGoalTypeMeta } from '../../src/constants/goalTypes';
import { colors, spacing, typography } from '../../src/theme';

export default function HomeScreen() {
  const { goal, transactions, settings } = useGoalContext();
  const router = useRouter();

  if (!goal) {
    return <Redirect href="/onboarding" />;
  }

  const progress = calculateGoalProgress(goal, transactions);
  const meta = getGoalTypeMeta(goal.type);
  const currency = settings.currency;

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{meta.label.toUpperCase()}</Text>
          <Text style={styles.goalName}>{goal.name}</Text>
        </View>
        {goal.imageUri ? (
          <Image source={{ uri: goal.imageUri }} style={styles.thumb} contentFit="cover" />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Text style={{ fontSize: 26 }}>{meta.emoji}</Text>
          </View>
        )}
      </View>

      <Animated.View entering={FadeInDown.duration(600)} style={styles.ringWrap}>
        <ProgressRing progress={progress.progressRatio} size={230} strokeWidth={18}>
          <Text style={styles.percent}>{progress.percent}%</Text>
          <Text style={styles.ringLabel}>funded</Text>
        </ProgressRing>
      </Animated.View>

      <Text style={styles.amountLine}>
        {formatCurrency(progress.savedAmount, currency)}
        <Text style={styles.amountLineMuted}> / {formatCurrency(goal.targetAmount, currency)}</Text>
      </Text>

      {progress.isComplete ? (
        <Card variant="cream" style={styles.completeCard}>
          <Text style={styles.completeTitle}>🎉 Goal reached!</Text>
          <Text style={styles.completeBody}>
            You hit your target for {goal.name}. Time to make it real.
          </Text>
        </Card>
      ) : (
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <StatTile
              label="Remaining"
              value={formatCurrency(progress.remainingAmount, currency)}
              accentColor={colors.accent}
            />
            <StatTile
              label={progress.isPastDue ? 'Deadline' : 'Days left'}
              value={progress.isPastDue ? 'Passed' : `${progress.daysLeft}`}
              accentColor={progress.isPastDue ? colors.spend : colors.inkPrimary}
            />
          </View>
          <View style={styles.paceRow}>
            <Text style={styles.paceLabel}>To hit your goal by {formatDateShort(goal.targetDate)}, save</Text>
            <View style={styles.paceValues}>
              <View style={styles.paceItem}>
                <Text style={styles.paceAmount}>{formatCurrency(progress.dailyNeeded, currency)}</Text>
                <Text style={styles.paceUnit}>per day</Text>
              </View>
              <View style={styles.paceDivider} />
              <View style={styles.paceItem}>
                <Text style={styles.paceAmount}>{formatCurrency(progress.weeklyNeeded, currency)}</Text>
                <Text style={styles.paceUnit}>per week</Text>
              </View>
            </View>
          </View>
        </Card>
      )}

      <View style={styles.footer}>
        <Button label="Add transaction" onPress={() => router.push('/add-transaction')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerText: {
    flexShrink: 1,
  },
  eyebrow: {
    ...typography.micro,
    color: colors.accentLight,
    marginBottom: spacing.xxs,
  },
  goalName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  thumbPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    marginVertical: spacing.md,
  },
  percent: {
    ...typography.display,
    color: colors.textPrimary,
    fontSize: 42,
  },
  ringLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  amountLine: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  amountLineMuted: {
    color: colors.textTertiary,
  },
  statsCard: {
    alignSelf: 'stretch',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paceRow: {
    borderTopWidth: 1,
    borderTopColor: colors.creamBorder,
    paddingTop: spacing.md,
  },
  paceLabel: {
    ...typography.caption,
    color: colors.inkSecondary,
    marginBottom: spacing.sm,
  },
  paceValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paceItem: {
    flex: 1,
  },
  paceAmount: {
    ...typography.h2,
    color: colors.accentDark,
  },
  paceUnit: {
    ...typography.caption,
    color: colors.inkTertiary,
  },
  paceDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.creamBorder,
    marginHorizontal: spacing.md,
  },
  completeCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  completeTitle: {
    ...typography.h2,
    color: colors.inkPrimary,
    marginBottom: spacing.xs,
  },
  completeBody: {
    ...typography.body,
    color: colors.inkSecondary,
    textAlign: 'center',
  },
  footer: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
});
