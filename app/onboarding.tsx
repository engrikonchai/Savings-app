import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { ScreenContainer, Button, GoalTypeCard, LogoMark } from '../src/components';
import { GOAL_TYPES } from '../src/constants/goalTypes';
import { GoalType } from '../src/types/models';
import { colors, spacing, typography } from '../src/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<GoalType | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push({ pathname: '/create-goal', params: { type: selected } });
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.header}>
        <Animated.View entering={FadeInUp.duration(450)} style={styles.logoWrap}>
          <LogoMark size={40} />
        </Animated.View>
        <Animated.Text entering={FadeInUp.duration(500)} style={styles.kicker}>
          WELCOME TO CARGOAL
        </Animated.Text>
        <Animated.Text entering={FadeInUp.duration(600).delay(80)} style={styles.title}>
          What are you{'\n'}saving for?
        </Animated.Text>
        <Animated.Text entering={FadeInUp.duration(600).delay(140)} style={styles.subtitle}>
          Pick a goal and we'll help you track every step to get there.
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInDown.duration(600).delay(180)} style={styles.grid}>
        {GOAL_TYPES.map((meta) => (
          <GoalTypeCard
            key={meta.type}
            meta={meta}
            selected={selected === meta.type}
            onPress={() => setSelected(meta.type)}
          />
        ))}
      </Animated.View>

      <View style={styles.footer}>
        <Button label="Continue" onPress={handleContinue} disabled={!selected} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: spacing.xl,
  },
  logoWrap: {
    marginBottom: spacing.md,
  },
  kicker: {
    ...typography.micro,
    color: colors.accentLight,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodyLarge,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
