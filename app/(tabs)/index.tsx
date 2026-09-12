import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  ScreenContainer,
  Card,
  ProgressRing,
  StatTile,
  MotivationCard,
  FloatingActionButton,
} from '../../src/components';
import { useGoalContext } from '../../src/store/GoalContext';
import { calculateGoalProgress, calculateTargetStatus } from '../../src/utils/goalMath';
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
  const targetStatus = calculateTargetStatus(goal, progress);
  const meta = getGoalTypeMeta(goal.type);
  const currency = settings.currency;
  const isZeroState = progress.percent === 0 && !progress.isComplete;

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{meta.label.toUpperCase()}</Text>
            <Text style={styles.goalName}>{goal.name}</Text>
          </View>
          {goal.imageUri ? (
            <Image source={{ uri: goal.imageUri }} style={styles.thumb} contentFit="cover" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Ionicons name={meta.icon} size={24} color={colors.textPrimary} />
            </View>
          )}
        </View>

        <Animated.View entering={FadeInDown.duration(600)} style={styles.ringWrap}>
          <ProgressRing
            progress={progress.progressRatio}
            size={224}
            strokeWidth={14}
            imageUri={goal.imageUri}
            iconName={meta.silhouetteIcon}
          >
            <Text style={styles.percent}>{progress.percent}%</Text>
            <Text style={styles.ringLabel}>funded</Text>
          </ProgressRing>
        </Animated.View>

        <Text style={styles.amountLine}>
          {formatCurrency(progress.savedAmount, currency)}
          <Text style={styles.amountLineMuted}> / {formatCurrency(goal.targetAmount, currency)}</Text>
        </Text>

        {!progress.isComplete && (
          <View style={styles.statusRow}>
            <Ionicons
              name={isZeroState ? 'sparkles' : 'trending-up'}
              size={14}
              color={colors.accentLight}
            />
            <Text style={styles.statusText}>
              {isZeroState ? meta.zeroStateCopy(formatCurrency(10, currency)) : targetStatus.label}
            </Text>
          </View>
        )}

        {progress.isComplete ? (
          <Card variant="cream" style={styles.completeCard}>
            <Ionicons name="trophy" size={28} color={colors.accentDark} style={styles.completeIcon} />
            <Text style={styles.completeTitle}>Goal reached!</Text>
            <Text style={styles.completeBody}>
              You hit your target for {goal.name}. Time to make it real.
            </Text>
          </Card>
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatTile
                icon="wallet-outline"
                label="Remaining"
                value={formatCurrency(progress.remainingAmount, currency)}
                accentColor={colors.accentDark}
              />
              <StatTile
                icon="calendar-outline"
                label={progress.isPastDue ? 'Deadline' : 'Days left'}
                value={progress.isPastDue ? 'Passed' : `${progress.daysLeft}`}
                accentColor={progress.isPastDue ? colors.spend : colors.inkPrimary}
              />
            </View>

            <MotivationCard
              label={`To hit your goal by ${formatDateShort(goal.targetDate)}, save`}
              dailyValue={formatCurrency(progress.dailyNeeded, currency)}
              weeklyValue={formatCurrency(progress.weeklyNeeded, currency)}
            />
          </>
        )}

        <View style={styles.fabSpacer} />
      </ScrollView>

      <View style={styles.fabWrap} pointerEvents="box-none">
        <FloatingActionButton label="Add money" onPress={() => router.push('/add-transaction')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  thumbPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.backgroundElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  ringWrap: {
    marginVertical: spacing.xs,
  },
  percent: {
    ...typography.mega,
    color: colors.textPrimary,
    fontSize: 46,
    lineHeight: 50,
  },
  ringLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountLine: {
    ...typography.mega,
    fontSize: 38,
    lineHeight: 42,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  amountLineMuted: {
    color: colors.textTertiary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.md,
    maxWidth: '100%',
  },
  statusText: {
    ...typography.caption,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'stretch',
    marginBottom: spacing.sm,
  },
  completeCard: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  completeIcon: {
    marginBottom: spacing.xs,
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
  fabSpacer: {
    height: 140,
  },
  fabWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.lg,
    alignItems: 'center',
  },
});
