import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
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

const QUICK_AMOUNTS = [5, 10, 20, 50];
const SOURCE_OPTIONS = ['Tips', 'Salary', 'Gift', 'Other'];

export default function AddTransactionScreen() {
  const { goal, addTransaction } = useGoalContext();
  const router = useRouter();
  const amountInputRef = useRef<TextInput>(null);

  const [kind, setKind] = useState<TransactionKind>('saved');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!goal) {
    return <Redirect href="/onboarding" />;
  }

  const amount = parseFloat(amountText.replace(',', '.'));
  const isValid = !Number.isNaN(amount) && amount > 0;
  const kindColor = kind === 'saved' ? colors.accent : colors.spend;
  const kindColorDark = kind === 'saved' ? colors.accentDark : colors.spend;

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
          ref={amountInputRef}
          label="Amount"
          placeholder="50"
          prefix="€"
          keyboardType="decimal-pad"
          value={amountText}
          onChangeText={setAmountText}
          autoFocus
        />

        <View style={styles.quickAmounts}>
          {QUICK_AMOUNTS.map((quick) => {
            const selected = amountText === String(quick);
            return (
              <PressableScale
                key={quick}
                style={[
                  styles.quickChip,
                  selected && { backgroundColor: kindColor, borderColor: kindColorDark },
                ]}
                haptic="selection"
                onPress={() => setAmountText(String(quick))}
              >
                <Text style={[styles.quickChipText, selected && styles.quickChipTextSelected]}>€{quick}</Text>
              </PressableScale>
            );
          })}
          <PressableScale
            style={styles.quickChip}
            haptic="selection"
            onPress={() => {
              setAmountText('');
              amountInputRef.current?.focus();
            }}
          >
            <Ionicons name="create-outline" size={14} color={colors.inkPrimary} />
            <Text style={styles.quickChipText}>Custom</Text>
          </PressableScale>
        </View>

        <TextField
          label="Note (optional)"
          placeholder={kind === 'saved' ? 'Birthday money' : 'Weekend out'}
          value={note}
          onChangeText={setNote}
          maxLength={60}
        />

        {kind === 'saved' && (
          <View style={styles.sourceRow}>
            {SOURCE_OPTIONS.map((source) => {
              const selected = note === source;
              return (
                <PressableScale
                  key={source}
                  style={[styles.sourceChip, selected && styles.sourceChipSelected]}
                  haptic="selection"
                  onPress={() => setNote(selected ? '' : source)}
                >
                  <Text style={[styles.sourceChipText, selected && styles.sourceChipTextSelected]}>{source}</Text>
                </PressableScale>
              );
            })}
          </View>
        )}
      </Card>

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
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 44,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.creamMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  quickChipText: {
    ...typography.caption,
    color: colors.inkPrimary,
  },
  quickChipTextSelected: {
    color: colors.inkPrimary,
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: -spacing.xs,
  },
  sourceChip: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 999,
    backgroundColor: colors.creamMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  sourceChipSelected: {
    backgroundColor: colors.accentDark,
    borderColor: colors.accentDark,
  },
  sourceChipText: {
    ...typography.caption,
    color: colors.inkSecondary,
  },
  sourceChipTextSelected: {
    color: colors.cream,
  },
  footer: {
    marginTop: spacing.xl,
  },
});
