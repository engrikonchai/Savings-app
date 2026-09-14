import React, { useMemo, useState } from 'react';
import { Shell } from '../components/Shell';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { GoalIcon } from '../components/Icon';
import { Chip, ColorPicker, SectionLabel } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatMonthYear, weeksBetween } from '../lib/calc';
import { monthOptionDate } from './onboarding/CreateGoalSteps';
import { currencySymbol } from '../lib/currency';
import { GOAL_TYPES } from '../lib/goalTypes';
import type { GoalTypeId } from '../lib/types';

interface Props {
  goalId: string;
  onBack: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export const EditGoal: React.FC<Props> = ({ goalId, onBack, onSaved, onDeleted }) => {
  const { state, today, editGoal, deleteGoal } = useApp();
  const goal = state.goals.find((g) => g.id === goalId) ?? state.goal!;
  const symbol = currencySymbol(state.currency);

  const [name, setName] = useState(goal.name);
  const [typeId, setTypeId] = useState<GoalTypeId>(goal.typeId);
  const [amount, setAmount] = useState(goal.targetAmount);
  const [color, setColor] = useState(goal.color);
  const [amountFocused, setAmountFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => Array.from({ length: 18 }, (_, i) => monthOptionDate(today, i + 1)), [today]);
  const initialIndex = useMemo(() => {
    const goalDate = new Date(goal.predictedDate);
    const idx = options.findIndex((d) => d.getMonth() === goalDate.getMonth() && d.getFullYear() === goalDate.getFullYear());
    return idx >= 0 ? idx : 0;
  }, [options, goal.predictedDate]);
  const [monthIndex, setMonthIndex] = useState(initialIndex);

  const targetDate = options[monthIndex];
  const weeks = weeksBetween(today, targetDate);
  const remaining = Math.max(0, amount - goal.currentSaved);
  const weekly = Math.ceil(remaining / weeks);

  const save = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const ok = await editGoal(goal.id, {
      name: name.trim() || goal.name,
      typeId,
      targetAmount: amount,
      predictedDate: targetDate.toISOString(),
      color,
    });
    setSubmitting(false);
    if (ok) onSaved();
    else setError('Could not save your changes.');
  };

  const remove = async () => {
    if (deleting) return;
    const ok = window.confirm(`Delete "${goal.name}"? This also deletes its transaction history. This can't be undone.`);
    if (!ok) return;
    setDeleting(true);
    setError(null);
    const success = await deleteGoal(goal.id);
    setDeleting(false);
    if (success) onDeleted();
    else setError('Could not delete this goal.');
  };

  return (
    <Shell
      showBack
      onBack={onBack}
      bottomSlot={<PrimaryCTA label={submitting ? 'Saving…' : 'Save changes'} onClick={save} disabled={!name.trim() || amount <= 0 || submitting} />}
    >
      <div className="fade-in" style={{ padding: '104px 28px 130px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 26 }}>Edit goal</div>
        {error && (
          <div style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: 'var(--negative)', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <SectionLabel>Name</SectionLabel>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your dream"
          style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--blue)', paddingBottom: 10, fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text)', outline: 'none', marginBottom: 26 }}
        />

        <SectionLabel>Type</SectionLabel>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 26, marginLeft: -28, marginRight: -28, paddingLeft: 28, paddingRight: 28 }}>
          {GOAL_TYPES.map((t) => {
            const selected = t.id === typeId;
            return (
              <div
                key={t.id}
                onClick={() => setTypeId(t.id)}
                role="button"
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 14px',
                  borderRadius: 9999,
                  background: selected ? 'var(--blue-tint)' : 'var(--chip-bg)',
                  border: `1px solid ${selected ? 'var(--blue)' : 'var(--chip-border)'}`,
                  cursor: 'pointer',
                }}
              >
                <GoalIcon type={t.id} size={16} color={selected ? 'var(--blue)' : 'var(--text-secondary)'} />
                <span style={{ fontSize: 13, fontWeight: 600, color: selected ? 'var(--text)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{t.label}</span>
              </div>
            );
          })}
        </div>

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
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-secondary)' }}>
            {symbol}
            {goal.currentSaved.toLocaleString('en-US')}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 26 }}>
          Calculated from your transaction history — add money or log a Dream Days decision to change it.
        </div>

        <SectionLabel>Target date</SectionLabel>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, marginBottom: 26, marginLeft: -28, marginRight: -28, paddingLeft: 28, paddingRight: 28 }}>
          {options.map((d, i) => (
            <Chip key={i} label={formatMonthYear(d)} selected={i === monthIndex} onClick={() => setMonthIndex(i)} />
          ))}
        </div>

        <SectionLabel>Color</SectionLabel>
        <div style={{ marginBottom: 26 }}>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div style={{ borderRadius: 20, background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', padding: 20, marginBottom: 26 }}>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text)', lineHeight: 1.4 }}>
            Save {symbol}{weekly.toLocaleString('en-US')}/week to reach it by {formatMonthYear(targetDate)}.
          </div>
        </div>

        <div
          onClick={remove}
          role="button"
          style={{
            textAlign: 'center',
            padding: '14px 0',
            borderRadius: 16,
            border: '1px solid rgba(255,59,48,0.3)',
            cursor: deleting ? 'default' : 'pointer',
            opacity: deleting ? 0.6 : 1,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--negative)' }}>{deleting ? 'Deleting…' : 'Delete this goal'}</span>
        </div>
      </div>
    </Shell>
  );
};
