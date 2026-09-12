import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

interface MotivationCardProps {
  label: string;
  dailyValue: string;
  weeklyValue: string;
}

/**
 * The daily/weekly saving pace, styled as a standout highlight rather than
 * plain text — a dark glass card with an emerald glow chip.
 */
export function MotivationCard({ label, dailyValue, weeklyValue }: MotivationCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Ionicons name="flash" size={14} color={colors.accentDark} />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.item}>
          <Text style={styles.amount}>{dailyValue}</Text>
          <Text style={styles.unit}>per day</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.item}>
          <Text style={styles.amount}>{weeklyValue}</Text>
          <Text style={styles.unit}>per week</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(19,226,150,0.28)',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.accentLight,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  item: {
    flex: 1,
  },
  amount: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  unit: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(19,226,150,0.28)',
    marginHorizontal: spacing.md,
  },
});
