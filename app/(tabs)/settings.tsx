import React from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Card, Button, SegmentedControl } from '../../src/components';
import { useGoalContext } from '../../src/store/GoalContext';
import { CurrencyCode } from '../../src/types/models';
import { colors, spacing, typography } from '../../src/theme';

const CURRENCY_OPTIONS: { value: CurrencyCode; label: string }[] = [
  { value: 'EUR', label: 'EUR €' },
  { value: 'USD', label: 'USD $' },
  { value: 'GBP', label: 'GBP £' },
];

export default function SettingsScreen() {
  const { settings, updateSettings, resetAllData, goal } = useGoalContext();
  const router = useRouter();

  const handleReset = () => {
    Alert.alert(
      'Reset all data?',
      `This deletes ${goal ? `“${goal.name}” and ` : ''}all your saved transactions. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetAllData();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <SectionLabel icon="cash-outline" text="Currency" />
      <Card style={styles.card}>
        <SegmentedControl
          options={CURRENCY_OPTIONS}
          value={settings.currency}
          onChange={(value) => updateSettings({ currency: value })}
        />
      </Card>

      <SectionLabel icon="notifications-outline" text="Notifications" />
      <Card style={[styles.card, styles.row]}>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>Daily reminders</Text>
          <Text style={styles.rowSubtitle}>Coming soon — get nudged to keep saving.</Text>
        </View>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
          trackColor={{ false: colors.creamBorder, true: colors.accent }}
          thumbColor={colors.cream}
        />
      </Card>

      <SectionLabel icon="shield-checkmark-outline" text="Data" />
      <Card style={styles.card}>
        <Text style={styles.rowSubtitle}>
          CarGoal stores everything only on this device. Nothing is uploaded anywhere.
        </Text>
      </Card>
      <Button label="Reset all data" variant="danger" onPress={handleReset} style={styles.resetButton} />
    </ScreenContainer>
  );
}

function SectionLabel({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.sectionLabelRow}>
      <Ionicons name={icon} size={14} color={colors.textTertiary} />
      <Text style={styles.sectionLabel}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  card: {
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowText: {
    flex: 1,
    marginRight: spacing.md,
  },
  rowTitle: {
    ...typography.h3,
    color: colors.inkPrimary,
    marginBottom: 2,
  },
  rowSubtitle: {
    ...typography.body,
    color: colors.inkSecondary,
  },
  resetButton: {
    marginTop: spacing.xl,
  },
});
