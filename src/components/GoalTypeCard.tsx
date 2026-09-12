import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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
      <View style={[styles.emojiWrap, selected && styles.emojiWrapSelected]}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
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
    borderColor: 'rgba(255,255,255,0.06)',
    gap: spacing.sm,
  },
  cardSelected: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentLight,
  },
  emojiWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiWrapSelected: {
    backgroundColor: 'rgba(53,164,107,0.18)',
  },
  emoji: {
    fontSize: 28,
  },
  label: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.accentLight,
  },
});
