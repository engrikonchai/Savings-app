import React, { useState } from 'react';
import { Shell } from '../components/Shell';
import { TwoChoiceBar, PrimaryCTA } from '../components/PrimaryCTA';
import { useApp } from '../context/AppContext';
import { computePace, daysWorth, formatDayMonth, addDays, clampFutureDate } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import { goalCopy } from '../lib/goalTypes';

interface Props {
  onDone: () => void;
  onGoalCompleted: () => void;
}

type Result = 'skipped' | 'bought' | null;

export const DreamDays: React.FC<Props> = ({ onDone, onGoalCompleted }) => {
  const { state, today, addSkip, addPurchase } = useApp();
  const goal = state.goal!;
  const symbol = currencySymbol(state.currency);
  const copy = goalCopy(goal.typeId, goal.name);

  const [amount, setAmount] = useState(18);
  const [focused, setFocused] = useState(false);
  const [name, setName] = useState('');
  const [result, setResult] = useState<Result>(null);
  const [newDateLabel, setNewDateLabel] = useState('');

  const pace = computePace(goal, today);
  const costDays = daysWorth(amount, pace.weekly);
  const oldDateLabel = formatDayMonth(new Date(goal.predictedDate));
  const previewNewDate = clampFutureDate(addDays(goal.predictedDate, costDays), today);
  const previewNewDateLabel = formatDayMonth(previewNewDate);

  const skipIt = () => {
    const tx = addSkip(amount, name);
    const shifted = clampFutureDate(addDays(goal.predictedDate, -tx.daysDelta), today);
    setNewDateLabel(formatDayMonth(shifted));
    setResult('skipped');
    if (goal.currentSaved + amount >= goal.targetAmount) {
      setTimeout(onGoalCompleted, 1400);
    }
  };

  const buyAnyway = () => {
    const tx = addPurchase(amount, name);
    const shifted = clampFutureDate(addDays(goal.predictedDate, -tx.daysDelta), today);
    setNewDateLabel(formatDayMonth(shifted));
    setResult('bought');
  };

  if (result === 'skipped') {
    return (
      <Shell showBack onBack={onDone} bottomSlot={<PrimaryCTA label="Back to dashboard" onClick={onDone} />}>
        <div
          className="fade-in"
          style={{ padding: '0 32px', minHeight: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 10 }}>Nice — saved instead.</div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 30 }}>
            {copy.stayPrefix} now lands {newDateLabel}.
          </div>
        </div>
      </Shell>
    );
  }
  if (result === 'bought') {
    return (
      <Shell showBack onBack={onDone} bottomSlot={<PrimaryCTA label="Back to dashboard" onClick={onDone} variant="outline" />}>
        <div
          className="fade-in"
          style={{ padding: '0 32px', minHeight: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 10 }}>Logged. No judgment.</div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 30 }}>
            {copy.landsPrefix} now lands {costDays.toFixed(1)} days later, on {newDateLabel}.
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell showBack onBack={onDone} bottomSlot={<TwoChoiceBar primaryLabel="Skip it — save instead" onPrimary={skipIt} secondaryLabel="Buy anyway" onSecondary={buyAnyway} />}>
      <div className="fade-in" style={{ padding: '104px 28px 150px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 8 }}>Should I buy it?</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>No judgment — just information.</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, justifyContent: 'center', borderBottom: '1.5px dashed var(--divider)', paddingBottom: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>{symbol}</span>
          <input
            value={focused ? String(amount || '') : amount.toLocaleString('en-US')}
            onChange={(e) => setAmount(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            inputMode="numeric"
            style={{ width: 150, background: 'transparent', border: 'none', fontSize: 44, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', outline: 'none', textAlign: 'center' }}
          />
        </div>
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 24 }}>Tap to edit</div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="What is it? (optional)"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'transparent',
            border: 'none',
            borderBottom: '1.5px solid var(--chip-border)',
            paddingBottom: 10,
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--text)',
            outline: 'none',
            marginBottom: 26,
          }}
        />

        <div style={{ borderRadius: 20, background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', padding: 20 }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
            {amount > 0 ? `This costs you ${costDays.toFixed(1)} Dream Days.` : 'Enter an amount to see the cost.'}
          </div>
          {amount > 0 && (
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {copy.movesPrefix} moves from {oldDateLabel} to {previewNewDateLabel}.
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
};
