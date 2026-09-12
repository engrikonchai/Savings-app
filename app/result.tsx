import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer, Button, ProgressRing, ShareCard } from '../src/components';
import { useGoalContext } from '../src/store/GoalContext';
import { formatCurrency } from '../src/utils/currency';
import { calculateGoalProgress } from '../src/utils/goalMath';
import { getGoalTypeMeta } from '../src/constants/goalTypes';
import { shareViewAsImage } from '../src/utils/share';
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
  const { goal, transactions, settings } = useGoalContext();
  const shareCardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  if (!goal) {
    return <Redirect href="/onboarding" />;
  }

  const isSaved = params.kind === 'saved';
  const amount = Number(params.amount) || 0;
  const dayShift = Number(params.dayShift) || 0;
  const absShift = Math.abs(dayShift);

  const meta = getGoalTypeMeta(goal.type);
  // transactions[0] is the one just added (GoalContext unshifts new entries),
  // so dropping it gives the "before" state to animate the ring from.
  const beforeProgress = calculateGoalProgress(goal, transactions.slice(1));
  const afterProgress = calculateGoalProgress(goal, transactions);

  const accent = isSaved ? colors.accent : colors.spend;
  const amountLabel = formatCurrency(amount, settings.currency);
  const iconName: keyof typeof Ionicons.glyphMap = isSaved
    ? absShift > 0
      ? 'rocket'
      : 'checkmark-circle'
    : absShift > 0
      ? 'hourglass'
      : 'trending-down';

  const headline = isSaved
    ? absShift > 0
      ? `${amountLabel} added — you're ${absShift} day${absShift === 1 ? '' : 's'} closer.`
      : `${amountLabel} added — nice, that's saved!`
    : absShift > 0
      ? `${amountLabel} spent — ${absShift} day${absShift === 1 ? '' : 's'} farther away.`
      : `${amountLabel} logged.`;

  const body = isSaved
    ? 'Keep the momentum going — every deposit adds up.'
    : "You've got this — bounce back with your next deposit.";

  const shareTagline = afterProgress.isComplete
    ? `Goal reached! ${meta.label.toLowerCase()} unlocked 🎉`
    : `${afterProgress.percent}% of the way there — let's go!`;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const result = await shareViewAsImage(shareCardRef, {
        dialogTitle: `${goal.name} progress`,
        fileName: 'cargoal-progress.png',
      });
      if (result.shared) {
        await Haptics.selectionAsync().catch(() => {});
      }
    } catch {
      // Sharing failing shouldn't block the user from finishing the flow.
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <Animated.View entering={FadeIn.duration(400)} style={styles.ringWrap}>
        <ProgressRing
          progress={afterProgress.progressRatio}
          initialProgress={beforeProgress.progressRatio}
          size={188}
          strokeWidth={13}
          imageUri={goal.imageUri}
          iconName={meta.silhouetteIcon}
        >
          <Text style={styles.percent}>{afterProgress.percent}%</Text>
          <Text style={styles.percentLabel}>funded</Text>
        </ProgressRing>
      </Animated.View>

      <View style={styles.headlineRow}>
        <Ionicons name={iconName} size={20} color={accent} />
        <Text style={[styles.headline, { color: accent }]}>{headline}</Text>
      </View>
      <Text style={styles.body}>{body}</Text>

      <View style={styles.footer}>
        <Button label="Done" onPress={() => router.replace('/(tabs)')} />
        <Button
          label={sharing ? 'Preparing…' : 'Share progress'}
          variant="ghost"
          onPress={handleShare}
          loading={sharing}
          style={styles.shareButton}
        />
      </View>

      {/* Off-screen, always-mounted share card captured to an image on demand. */}
      <View style={styles.captureHost} pointerEvents="none">
        <View style={styles.captureAnchor}>
          <ShareCard
            ref={shareCardRef}
            goalName={goal.name}
            meta={meta}
            imageUri={goal.imageUri}
            savedAmount={afterProgress.savedAmount}
            targetAmount={goal.targetAmount}
            percent={afterProgress.percent}
            currency={settings.currency}
            tagline={shareTagline}
          />
        </View>
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
  ringWrap: {
    marginBottom: spacing.xl,
  },
  percent: {
    ...typography.mega,
    fontSize: 38,
    lineHeight: 42,
    color: colors.textPrimary,
  },
  percentLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  headline: {
    ...typography.h2,
    textAlign: 'center',
    flexShrink: 1,
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
    gap: spacing.sm,
  },
  shareButton: {
    marginTop: spacing.xs,
  },
  captureHost: {
    height: 0,
    width: 0,
    overflow: 'hidden',
  },
  captureAnchor: {
    position: 'absolute',
  },
});
