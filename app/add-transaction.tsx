import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Card, Button, TextField, SegmentedControl } from '../src/components';
import { PressableScale } from '../src/components/PressableScale';
import { useGoalContext } from '../src/store/GoalContext';
import { TransactionKind } from '../src/types/models';
import { calculateDayShift } from '../src/utils/goalMath';
import { colors, spacing, typography } from '../src/theme';

const KIND_OPTIONS: { value: TransactionKind; label: string }[] = [
  { value: 'saved', label: 'Money saved' },
  { value: 'spent', label: 'Money spent' },
];

export default function AddTransactionScreen() {
  const { goal, addTransaction } = useGoalContext();
  const router = useRouter();

  const [kind, setKind] = useState<TransactionKind>('saved');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!goal) {
    return <Redirect href="/onboarding" />;
  }

  const amount = parseFloat(amountText.replace(',', '.'));
  const isValid = !Number.isNaN(amount) && amount > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setSubmitting(true);
    try {
      await addTransaction({ kind, amount, note });
      const signedAmount = kind === 'saved' ? amount : -amount;
      const dayShift = calculateDayShift(goal, signedAmount);
      await Haptics.notificationAsync(
        kind === 'saved'
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Warning,
      );
      router.replace({
        pathname: '/result',
        params: {
          kind,
          amount: String(amount),
          dayShift: String(dayShift),
          note,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.handle} />
      <Text style={styles.title}>Log a transaction</Text>
      <Text style={styles.subtitle}>Toward {goal.name}</Text>

      <SegmentedControl
        options={KIND_OPTIONS}
        value={kind}
        onChange={setKind}
        activeColor={kind === 'saved' ? colors.accent : colors.spend}
      />

      <Card style={styles.card}>
        <TextField
          label="Amount"
          placeholder="50"
          prefix="€"
          keyboardType="decimal-pad"
          value={amountText}
          onChangeText={setAmountText}
          autoFocus
        />
        <TextField
          label="Note (optional)"
          placeholder={kind === 'saved' ? 'Birthday money' : 'Weekend out'}
          value={note}
          onChangeText={setNote}
          maxLength={60}
        />
      </Card>

      <View style={styles.quickAmounts}>
        {[10, 25, 50, 100].map((quick) => (
          <PressableScale
            key={quick}
            style={styles.quickChip}
            haptic="selection"
            onPress={() => setAmountText(String(quick))}
          >
            <Text style={styles.quickChipText}>€{quick}</Text>
          </PressableScale>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          label={kind === 'saved' ? 'Add to savings' : 'Log spending'}
          onPress={handleSubmit}
          disabled={!isValid}
          loading={submitting}
          style={kind === 'spent' ? { backgroundColor: colors.spend } : undefined}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  card: {
    marginTop: spacing.lg,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.backgroundElevated,
  },
  quickChipText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
