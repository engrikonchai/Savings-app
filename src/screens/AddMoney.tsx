import React, { useState } from 'react';
import { Shell } from '../components/Shell';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { Chip, SectionLabel } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import { goalCopy } from '../lib/goalTypes';

const QUICK_AMOUNTS = [5, 10, 20, 50];
const SOURCES = ['Tips', 'Salary', 'Gift', 'Sold something', 'Other'];

interface Props {
  onDone: () => void;
  onGoalCompleted: () => void;
}

export const AddMoney: React.FC<Props> = ({ onDone, onGoalCompleted }) => {
  const { state, addContribution } = useApp();
  const goal = state.goal!;
  const symbol = currencySymbol(state.currency);
  const copy = goalCopy(goal.typeId, goal.name);

  const [step, setStep] = useState<'input' | 'success'>('input');
  const [amount, setAmount] = useState(20);
  const [focused, setFocused] = useState(false);
  const [source, setSource] = useState('Salary');
  const [result, setResult] = useState<{ amount: number; daysDelta: number; newSaved: number } | null>(null);

  const confirm = () => {
    if (amount <= 0) return;
    const tx = addContribution(amount, source);
    const newSaved = goal.currentSaved + amount;
    setResult({ amount, daysDelta: tx.daysDelta, newSaved });
    setStep('success');
    if (newSaved >= goal.targetAmount) {
      // let the success message render briefly before handing off to the celebration flow
      setTimeout(onGoalCompleted, 1400);
    }
  };

  if (step === 'success' && result) {
    return (
      <Shell showBack onBack={onDone}>
        <div
          className="fade-in"
          style={{
            padding: '0 32px',
            minHeight: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: 9999,
              background: 'var(--blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 22,
              boxShadow: '0 10px 26px var(--blue-shadow)',
            }}
          >
            <svg width="24" height="18" viewBox="0 0 26 20" fill="none">
              <path d="M2 10L10 18L24 2" stroke="var(--on-blue)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 10 }}>
            {formatMoney(result.amount, symbol)} added.
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
            {copy.closerPrefix} <span style={{ color: 'var(--text)', fontWeight: 700 }}>{Math.abs(result.daysDelta).toFixed(1)} days closer</span>.
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            New total: {formatMoney(result.newSaved, symbol)} of {formatMoney(goal.targetAmount, symbol)}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell showBack onBack={onDone} bottomSlot={<PrimaryCTA label={`Add ${symbol}${amount}`} onClick={confirm} disabled={amount <= 0} />}>
      <div className="fade-in" style={{ padding: '104px 28px 130px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 30 }}>Add money</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, borderBottom: '1.5px dashed var(--divider)', paddingBottom: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)' }}>{symbol}</span>
            <input
              value={focused ? String(amount || '') : amount.toLocaleString('en-US')}
              onChange={(e) => setAmount(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              inputMode="numeric"
              style={{ width: 170, background: 'transparent', border: 'none', fontSize: 50, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Tap to edit</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {QUICK_AMOUNTS.map((v) => (
            <Chip key={v} label={`${symbol}${v}`} selected={v === amount} onClick={() => setAmount(v)} pill={false} flex />
          ))}
        </div>

        <SectionLabel>Where's this from?</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SOURCES.map((s) => (
            <Chip key={s} label={s} selected={s === source} onClick={() => setSource(s)} />
          ))}
        </div>
      </div>
    </Shell>
  );
};
