import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer, LogoMark } from '../../src/components';
import { useGoalContext } from '../../src/store/GoalContext';
import { Transaction } from '../../src/types/models';
import { formatCurrency } from '../../src/utils/currency';
import { formatDateTime, relativeDayLabel } from '../../src/utils/date';
import { colors, radius, spacing, typography } from '../../src/theme';

type Row =
  | { kind: 'header'; id: string; label: string }
  | { kind: 'transaction'; id: string; transaction: Transaction };

export default function HistoryScreen() {
  const { goal, transactions, settings } = useGoalContext();

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    let lastLabel: string | null = null;
    for (const t of transactions) {
      const label = relativeDayLabel(t.createdAt);
      if (label !== lastLabel) {
        result.push({ kind: 'header', id: `h-${label}-${t.id}`, label });
        lastLabel = label;
      }
      result.push({ kind: 'transaction', id: t.id, transaction: t });
    }
    return result;
  }, [transactions]);

  if (!goal) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <ScreenContainer style={styles.screen}>
      <Text style={styles.title}>History</Text>
      {transactions.length === 0 ? (
        <View style={styles.empty}>
          <LogoMark size={76} style={styles.emptyMark} />
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            Every euro you save or spend toward {goal.name} will show up here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            item.kind === 'header' ? (
              <Text style={styles.sectionLabel}>{item.label}</Text>
            ) : (
              <TransactionRow transaction={item.transaction} currency={settings.currency} />
            )
          }
        />
      )}
    </ScreenContainer>
  );
}

function TransactionRow({
  transaction,
  currency,
}: {
  transaction: Transaction;
  currency: Parameters<typeof formatCurrency>[1];
}) {
  const isSaved = transaction.kind === 'saved';
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: isSaved ? colors.saveSoft : colors.spendSoft }]}>
        <Ionicons
          name={isSaved ? 'arrow-up-circle' : 'arrow-down-circle'}
          size={22}
          color={isSaved ? colors.save : colors.spend}
        />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowNote} numberOfLines={1}>
          {transaction.note || (isSaved ? 'Money saved' : 'Money spent')}
        </Text>
        <Text style={styles.rowTime}>{formatDateTime(transaction.createdAt)}</Text>
      </View>
      <Text style={[styles.rowAmount, { color: isSaved ? colors.save : colors.spend }]}>
        {isSaved ? '+' : '−'}
        {formatCurrency(transaction.amount, currency)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowBody: {
    flex: 1,
    marginRight: spacing.sm,
  },
  rowNote: {
    ...typography.bodyLarge,
    color: colors.textPrimary,
  },
  rowTime: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: 2,
  },
  rowAmount: {
    ...typography.h3,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
  },
  emptyMark: {
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
