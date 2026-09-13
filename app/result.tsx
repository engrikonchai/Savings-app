import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ScreenContainer, Button, ProgressRing, ShareCard, CarBuildVisual } from '../src/components';
import { useGoalContext } from '../src/store/GoalContext';
import { formatCurrency } from '../src/utils/currency';
import { calculateGoalProgress } from '../src/utils/goalMath';
import { getCrossedCarMilestone } from '../src/utils/milestones';
import { getGoalTypeMeta } from '../src/constants/goalTypes';
import { shareViewAsImage } from '../src/utils/share';
import { TransactionKind } from '../src/types/models';
import { colors, spacing, typography } from '../src/theme';

type ResultSource = 'reality-skip' | 'reality-buy' | undefined;

export default function ResultScreen() {
  const params = useLocalSearchParams<{
    kind: TransactionKind;
    amount: string;
    dayShift: string;
    note?: string;
    source?: ResultSource;
    dreamDays?: string;
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
  const source = params.source;
  const dreamDays = params.dreamDays !== undefined ? Number(params.dreamDays) || 0 : absShift;

  const meta = getGoalTypeMeta(goal.type);
  // transactions[0] is the one just added (GoalContext unshifts new entries),
  // so dropping it gives the "before" state to animate the ring from.
  const beforeProgress = calculateGoalProgress(goal, transactions.slice(1));
  const afterProgress = calculateGoalProgress(goal, transactions);
  const milestone = goal.type === 'car' ? getCrossedCarMilestone(beforeProgress, afterProgress) : null;
  const heroContent =
    goal.type === 'car' && !goal.imageUri ? <CarBuildVisual percent={afterProgress.percent} /> : undefined;

  const accent = isSaved ? colors.accent : colors.spend;
  const amountLabel = formatCurrency(amount, settings.currency);
  const iconName: keyof typeof Ionicons.glyphMap =
    source === 'reality-skip'
      ? 'leaf'
      : source === 'reality-buy'
        ? 'bag-handle'
        : isSaved
          ? absShift > 0
            ? 'rocket'
            : 'checkmark-circle'
          : absShift > 0
            ? 'hourglass'
            : 'trending-down';

  let headline: string;
  let body: string;
  if (source === 'reality-skip') {
    headline =
      absShift > 0
        ? `Great choice — your ${goal.name} is ${absShift} day${absShift === 1 ? '' : 's'} closer.`
        : `Great choice — that's saved toward your ${goal.name}.`;
    body = `You skipped ${amountLabel} and banked it instead. That's the whole game.`;
  } else if (source === 'reality-buy') {
    headline =
      absShift > 0
        ? `Enjoy it. Your ${goal.name} is now ${absShift} day${absShift === 1 ? '' : 's'} later.`
        : `Enjoy it — logged against your ${goal.name}.`;
    body = 'Every goal has room to live a little. Your next deposit gets you right back on track.';
  } else if (isSaved) {
    headline =
      absShift > 0
        ? `${amountLabel} added — you're ${absShift} day${absShift === 1 ? '' : 's'} closer.`
        : `${amountLabel} added — nice, that's saved!`;
    body = 'Keep the momentum going — every deposit adds up.';
  } else {
    headline =
      absShift > 0
        ? `${amountLabel} spent — ${absShift} day${absShift === 1 ? '' : 's'} farther away.`
        : `${amountLabel} logged.`;
    body = "You've got this — bounce back with your next deposit.";
  }

  const dreamDaysDelta = source === 'reality-buy' || !isSaved ? -dreamDays : dreamDays;

  const shareTagline =
    source === 'reality-skip'
      ? `I skipped ${amountLabel} today. My ${goal.name} is ${absShift} day${absShift === 1 ? '' : 's'} closer.`
      : afterProgress.isComplete
        ? `Goal reached! ${meta.label.toLowerCase()} unlocked 🎉`
        : `${afterProgress.percent}% of the way there — let's go!`;

  const handleShare = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const result = await shareViewAsImage(shareCardRef, {
        dialogTitle: `${goal.name} progress`,
        fileName: 'piggymy-progress.png',
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
          heroContent={heroContent}
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

      {milestone && (
        <View style={styles.milestoneBadge}>
          <Ionicons name="trophy" size={14} color={colors.accentLight} />
          <Text style={styles.milestoneText}>{milestone}</Text>
        </View>
      )}

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
            dreamDaysDelta={dreamDaysDelta}
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
  milestoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(19,226,150,0.35)',
    borderRadius: 999,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  milestoneText: {
    ...typography.caption,
    color: colors.accentLight,
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
