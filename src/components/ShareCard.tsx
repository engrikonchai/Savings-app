import React, { forwardRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LogoMark } from './LogoMark';
import { ProgressRing } from './ProgressRing';
import { colors, radius, spacing, typography } from '../theme';
import { GoalTypeMeta } from '../constants/goalTypes';
import { CurrencyCode } from '../types/models';
import { formatCurrency } from '../utils/currency';

interface ShareCardProps {
  goalName: string;
  meta: GoalTypeMeta;
  imageUri?: string;
  savedAmount: number;
  targetAmount: number;
  percent: number;
  currency: CurrencyCode;
  tagline: string;
}

/**
 * A beautiful vertical "progress" card sized for stories/status shares —
 * rendered off-flow and captured to an image by the result screen.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  { goalName, meta, imageUri, savedAmount, targetAmount, percent, currency, tagline },
  ref,
) {
  const clampedRatio = Math.max(0, Math.min(1, percent / 100));

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <LogoMark size={36} />

      <View style={styles.ringWrap}>
        <ProgressRing progress={clampedRatio} size={200} strokeWidth={14} imageUri={imageUri} iconName={meta.silhouetteIcon}>
          <Text style={styles.percent}>{percent}%</Text>
          <Text style={styles.percentLabel}>funded</Text>
        </ProgressRing>
      </View>

      <Text style={styles.goalName} numberOfLines={1}>
        {goalName}
      </Text>
      <Text style={styles.amountLine}>
        {formatCurrency(savedAmount, currency)}
        <Text style={styles.amountLineMuted}> / {formatCurrency(targetAmount, currency)}</Text>
      </Text>

      <Text style={styles.tagline}>{tagline}</Text>

      <View style={styles.footer}>
        <Ionicons name="flag" size={12} color={colors.accentLight} />
        <Text style={styles.footerText}>Tracked with CarGoal</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 320,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    alignItems: 'center',
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
