import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, Card, Button, TextField, SwipeDecisionCard } from '../src/components';
import { useGoalContext } from '../src/store/GoalContext';
import { calculateDreamDays } from '../src/utils/goalMath';
import { addDays, formatDateShort } from '../src/utils/date';
import { formatCurrency } from '../src/utils/currency';
import { colors, radius, spacing, typography } from '../src/theme';

type Stage = 'ask' | 'skip-offer';

export default function RealityCheckScreen() {
  const { goal, addTransaction, settings } = useGoalContext();
  const router = useRouter();

  const [amountText, setAmountText] = useState('');
  const [label, setLabel] = useState('');
  const [stage, setStage] = useState<Stage>('ask');
  const [submitting, setSubmitting] = useState(false);

  if (!goal) {
    return <Redirect href="/onboarding" />;
  }

  const amount = parseFloat(amountText.replace(',', '.'));
  const isValid = !Number.isNaN(amount) && amount > 0;
  const dreamDays = isValid ? calculateDreamDays(goal, amount) : 0;
  const roundedShift = Math.round(dreamDays);
  const projectedDate = isValid ? addDays(goal.targetDate, roundedShift) : goal.targetDate;
  const noteLabel = label.trim() || 'Reality check';

  const goToResult = (kind: 'saved' | 'spent', source: 'reality-skip' | 'reality-buy') => {
    router.replace({
      pathname: '/result',
      params: {
        kind,
        amount: String(amount),
        dayShift: String(kind === 'saved' ? roundedShift : -roundedShift),
        note: noteLabel,
        source,
        dreamDays: dreamDays.toFixed(1),
      },
    });
  };

  const handleBuy = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await addTransaction({ kind: 'spent', amount, note: noteLabel });
      goToResult('spent', 'reality-buy');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    if (!isValid) return;
    setStage('skip-offer');
  };

  const handleBankIt = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      await addTransaction({ kind: 'saved', amount, note: noteLabel });
      goToResult('saved', 'reality-skip');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.handle} />

      {stage === 'ask' ? (
        <>
          <Text style={styles.title}>Should I buy it?</Text>
          <Text style={styles.subtitle}>See what it costs your {goal.name} before you decide.</Text>

          <Card style={styles.card}>
            <TextField
              label="Amount"
              placeholder="18"
              prefix="€"
              keyboardType="decimal-pad"
              value={amountText}
              onChangeText={setAmountText}
              autoFocus
            />
            <TextField
              label="What is it? (optional)"
              placeholder="Food delivery"
              value={label}
              onChangeText={setLabel}
              maxLength={40}
            />
          </Card>

          {isValid && (
            <View style={styles.impactCard}>
              <View style={styles.impactHeader}>
                <Ionicons name="hourglass-outline" size={16} color={colors.accentLight} />
                <Text style={styles.impactHeaderText}>The real cost</Text>
              </View>
              <Text style={styles.impactHeadline}>
                This {formatCurrency(amount, settings.currency)} costs you{' '}
                <Text style={styles.impactHighlight}>{dreamDays.toFixed(1)} Dream Days</Text>.
              </Text>
              <Text style={styles.impactBody}>
                Your {goal.name} moves from {formatDateShort(goal.targetDate)} to{' '}
                <Text style={styles.impactHighlight}>{formatDateShort(projectedDate)}</Text>.
              </Text>
            </View>
          )}

          <View style={styles.decisionWrap}>
            <SwipeDecisionCard
              leftLabel="Skip it"
              leftIcon="leaf-outline"
              rightLabel="Buy it anyway"
              rightIcon="bag-handle-outline"
              onLeft={handleSkip}
              onRight={handleBuy}
            />
          </View>
        </>
      ) : (
        <View style={styles.offerWrap}>
          <View style={styles.offerIconWrap}>
            <Ionicons name="leaf" size={32} color={colors.accentLight} />
          </View>
          <Text style={styles.title}>Nice — you skipped it.</Text>
          <Text style={styles.subtitle}>
            Want to put that {formatCurrency(amount, settings.currency)} toward your {goal.name} instead?
          </Text>

          <View style={styles.offerFooter}>
            <Button label={`Add to ${goal.name}`} onPress={handleBankIt} loading={submitting} />
            <Button label="Not now" variant="ghost" onPress={() => router.back()} style={styles.notNowButton} />
          </View>
        </View>
      )}
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
    marginBottom: spacing.lg,
  },
  impactCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(19,226,150,0.28)',
    marginBottom: spacing.xl,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.sm,
  },
  impactHeaderText: {
    ...typography.micro,
    color: colors.accentLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  impactHeadline: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  impactBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  impactHighlight: {
    color: colors.accentLight,
    fontFamily: typography.h3.fontFamily,
  },
  decisionWrap: {
    marginTop: 'auto',
  },
  offerWrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  offerIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(19,226,150,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  offerFooter: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  notNowButton: {
    marginTop: spacing.xxs,
  },
});
