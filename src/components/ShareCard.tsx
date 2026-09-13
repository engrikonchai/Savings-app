import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogoMark } from './LogoMark';
import { ProgressRing } from './ProgressRing';
import { CarBuildVisual } from './CarBuildVisual';
import { colors, radius, spacing, typography } from '../theme';
import { GoalTypeMeta } from '../constants/goalTypes';
import { CurrencyCode } from '../types/models';
import { formatCurrency } from '../utils/currency';

const CARD_WIDTH = 320;
const CARD_HEIGHT = Math.round((CARD_WIDTH * 16) / 9);

interface ShareCardProps {
  goalName: string;
  meta: GoalTypeMeta;
  imageUri?: string;
  savedAmount: number;
  targetAmount: number;
  percent: number;
  currency: CurrencyCode;
  tagline: string;
  /** Positive = Dream Days gained (closer), negative = lost (farther). Omit to hide the chip. */
  dreamDaysDelta?: number;
}

/**
 * A beautiful vertical 9:16 "progress" card sized for stories/status shares —
 * rendered off-flow and captured to an image by the result screen.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { goalName, meta, imageUri, savedAmount, targetAmount, percent, currency, tagline, dreamDaysDelta },
  ref,
) {
  const clampedRatio = Math.max(0, Math.min(1, percent / 100));
  const heroContent = meta.type === 'car' && !imageUri ? <CarBuildVisual percent={percent} /> : undefined;
  const hasDreamDays = typeof dreamDaysDelta === 'number' && Math.abs(dreamDaysDelta) >= 0.05;
  const dreamDaysGained = (dreamDaysDelta ?? 0) >= 0;
  // Truncated in JS rather than via `numberOfLines` — react-native-web's line-clamp
  // technique for that prop doesn't render in the html2canvas capture used to share this card.
  const displayName = goalName.length > 22 ? `${goalName.slice(0, 21).trimEnd()}…` : goalName;

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <LogoMark size={36} />

      <View style={styles.ringWrap}>
        <ProgressRing
          progress={clampedRatio}
          size={190}
          strokeWidth={14}
          imageUri={imageUri}
          iconName={meta.silhouetteIcon}
          heroContent={heroContent}
        >
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.percentLabel}>funded</Text>
        </ProgressRing>
      </View>

      <Text style={styles.goalName}>{displayName}</Text>
      <Text style={styles.amountLine}>
        {formatCurrency(savedAmount, currency)}
        <Text style={styles.amountLineMuted}> / {formatCurrency(targetAmount, currency)}</Text>
      </Text>

      {hasDreamDays && (
        <View style={[styles.dreamDaysChip, !dreamDaysGained && styles.dreamDaysChipLost]}>
          <Ionicons
            name={dreamDaysGained ? 'trending-up' : 'trending-down'}
            size={13}
            color={dreamDaysGained ? colors.accentLight : colors.textSecondary}
          />
          <Text style={[styles.dreamDaysText, !dreamDaysGained && styles.dreamDaysTextLost]}>
            {dreamDaysGained ? '+' : '−'}
            {Math.abs(dreamDaysDelta ?? 0).toFixed(1)} Dream Day{Math.abs(dreamDaysDelta ?? 0) === 1 ? '' : 's'}
          </Text>
        </View>
      )}

      <Text style={styles.tagline}>{tagline}</Text>

      <View style={styles.footer}>
        <Ionicons name="flag" size={12} color={colors.accentLight} />
        <Text style={styles.footerText}>Tracked with PiggyMy</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  ringWrap: {
    marginVertical: spacing.lg,
  },
  percent: {
    ...typography.mega,
    fontSize: 40,
    lineHeight: 44,
    color: colors.textPrimary,
  },
  percentLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  goalName: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  amountLine: {
    ...typography.h1,
    color: colors.textPrimary,
    marginTop: spacing.xxs,
  },
  amountLineMuted: {
    color: colors.textTertiary,
  },
  dreamDaysChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(19,226,150,0.35)',
    borderRadius: 999,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  dreamDaysChipLost: {
    backgroundColor: colors.glass,
    borderColor: colors.glassBorder,
  },
  dreamDaysText: {
    ...typography.caption,
    color: colors.accentLight,
  },
  dreamDaysTextLost: {
    color: colors.textSecondary,
  },
  tagline: {
    ...typography.body,
    color: colors.accentLight,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xl,
  },
  footerText: {
    ...typography.micro,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
