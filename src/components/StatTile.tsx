import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';

interface StatTileProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accentColor?: string;
}

export function StatTile({ icon, label, value, accentColor = colors.inkPrimary }: StatTileProps) {
  return (
    <View style={styles.tile}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.inkSecondary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accentColor }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(24,26,22,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.micro,
    color: colors.inkTertiary,
    marginBottom: spacing.xxs,
    textTransform: 'uppercase',
  },
  value: {
    ...typography.h3,
  },
});
