import React, { useMemo, useState } from 'react';
import { Shell } from '../components/Shell';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { Chip, SectionLabel } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatMonthYear, weeksBetween } from '../lib/calc';
import { monthOptionDate } from './onboarding/CreateGoalSteps';
import { currencySymbol } from '../lib/currency';

interface Props {
  onBack: () => void;
  onSaved: () => void;
}

export const EditGoal: React.FC<Props> = ({ onBack, onSaved }) => {
  const { state, today, editGoal } = useApp();
  const goal = state.goal!;
  const symbol = currencySymbol(state.currency);

  const [name, setName] = useState(goal.name);
  const [amount, setAmount] = useState(goal.targetAmount);
  const [amountFocused, setAmountFocused] = useState(false);
  const [current, setCurrent] = useState(goal.currentSaved);
  const [currentFocused, setCurrentFocused] = useState(false);

  const options = useMemo(() => Array.from({ length: 18 }, (_, i) => monthOptionDate(today, i + 1)), [today]);
  const initialIndex = useMemo(() => {
    const goalDate = new Date(goal.predictedDate);
    const idx = options.findIndex((d) => d.getMonth() === goalDate.getMonth() && d.getFullYear() === goalDate.getFullYear());
    return idx >= 0 ? idx : 0;
  }, [options, goal.predictedDate]);
  const [monthIndex, setMonthIndex] = useState(initialIndex);

  const targetDate = options[monthIndex];
  const weeks = weeksBetween(today, targetDate);
  const remaining = Math.max(0, amount - current);
  const weekly = Math.ceil(remaining / weeks);

  const save = () => {
    editGoal({
      name: name.trim() || goal.name,
      targetAmount: amount,
      currentSaved: current,
      predictedDate: targetDate.toISOString(),
    });
    onSaved();
  };

  return (
    <Shell showBack onBack={onBack} bottomSlot={<PrimaryCTA label="Save changes" onClick={save} disabled={!name.trim() || amount <= 0} />}>
      <div className="fade-in" style={{ padding: '104px 28px 130px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 26 }}>Edit goal</div>

        <SectionLabel>Name</SectionLabel>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your dream"
          style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--blue)', paddingBottom: 10, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', outline: 'none', marginBottom: 26 }}
        />

        <SectionLabel>Target amount</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 20 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{symbol}</span>
          <input
            value={amountFocused ? String(amount || '') : amount.toLocaleString('en-US')}
            onChange={(e) => setAmount(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
            inputMode="numeric"
            style={{ width: 160, background: 'transparent', border: 'none', borderBottom: '1px solid var(--divider)', fontSize: 24, fontWeight: 800, color: 'var(--text)', outline: 'none' }}
          />
        </div>

        <SectionLabel>Already saved</SectionLabel>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 26 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>{symbol}</span>
          <input
            value={currentFocused ? String(current || '') : current.toLocaleString('en-US')}
            onChange={(e) => setCurrent(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
            onFocus={() => setCurrentFocused(true)}
            onBlur={() => setCurrentFocused(false)}
            inputMode="numeric"
            style={{ width: 160, background: 'transparent', border: 'none', borderBottom: '1px solid var(--divider)', fontSize: 24, fontWeight: 800, color: 'var(--text)', outline: 'none' }}
          />
        </div>

        <SectionLabel>Target date</SectionLabel>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 20, marginLeft: -28, marginRight: -28, paddingLeft: 28, paddingRight: 28 }}>
          {options.map((d, i) => (
            <Chip key={i} label={formatMonthYear(d)} selected={i === monthIndex} onClick={() => setMonthIndex(i)} />
          ))}
        </div>

        <div style={{ borderRadius: 20, background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text)', lineHeight: 1.4 }}>
            Save {symbol}{weekly.toLocaleString('en-US')}/week to reach it by {formatMonthYear(targetDate)}.
          </div>
        </div>
      </div>
    </Shell>
  );
};
