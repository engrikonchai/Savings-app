import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface StatTileProps {
  label: string;
  value: string;
  accentColor?: string;
}

export function StatTile({ label, value, accentColor = colors.inkPrimary }: StatTileProps) {
  return (
    <View style={styles.tile}>
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
    backgroundColor: 'rgba(28,30,27,0.05)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
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
