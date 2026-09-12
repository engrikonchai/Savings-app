import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../theme';
import { GoalTypeMeta } from '../constants/goalTypes';
import { PressableScale } from './PressableScale';

interface GoalTypeCardProps {
  meta: GoalTypeMeta;
  selected: boolean;
  onPress: () => void;
}

export function GoalTypeCard({ meta, selected, onPress }: GoalTypeCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      haptic="selection"
      style={[styles.card, selected && styles.cardSelected]}
    >
      {selected && (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark" size={12} color={colors.inkPrimary} />
        </View>
      )}
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Ionicons
          name={meta.icon}
          size={26}
          color={selected ? colors.accentLight : colors.textPrimary}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{meta.label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '47%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    gap: spacing.sm,
  },
  cardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(19,226,150,0.16)',
  },
  label: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.accentLight,
  },
});
