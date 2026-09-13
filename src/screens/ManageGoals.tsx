import React from 'react';
import { Shell } from '../components/Shell';
import { GoalIcon } from '../components/Icon';
import { SectionLabel } from '../components/ui';
import { useApp } from '../context/AppContext';
import { GOAL_TYPES } from '../lib/goalTypes';
import { computePace, formatMoney } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import type { GoalTypeId } from '../lib/types';

interface Props {
  onBack: () => void;
}

export const ManageGoals: React.FC<Props> = ({ onBack }) => {
  const { state, today, switchGoalType } = useApp();
  const goal = state.goal!;
  const symbol = currencySymbol(state.currency);
  const pace = computePace(goal, today);

  const handleSwitch = (id: GoalTypeId) => {
    if (id === goal.typeId) return;
    const ok = window.confirm('Switching goal type renames this goal to match the new type. Your saved amount and history stay the same. Continue?');
    if (ok) switchGoalType(id);
  };

  return (
    <Shell showBack onBack={onBack}>
      <div className="fade-in" style={{ padding: '104px 28px 112px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 20 }}>Manage goals</div>

        <SectionLabel>Active goal</SectionLabel>
        <div style={{ background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', borderRadius: 16, padding: 16, display: 'flex', alignItems: 'center', gap: 14, marginBottom: 26 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GoalIcon type={goal.typeId} size={22} color="var(--blue)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{goal.name}</div>
            <div style={{ fontSize: 12, color: 'var(--blue)' }}>
              {pace.pct}% saved · {formatMoney(goal.currentSaved, symbol)} of {formatMoney(goal.targetAmount, symbol)}
            </div>
          </div>
        </div>

        <SectionLabel>Switch goal type</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
          {GOAL_TYPES.map((g) => {
            const sel = g.id === goal.typeId;
            return (
              <div
                key={g.id}
                onClick={() => handleSwitch(g.id)}
                role="button"
                style={{ padding: '9px 15px', borderRadius: 9999, background: sel ? 'var(--blue)' : 'var(--chip-bg)', border: `1px solid ${sel ? 'var(--blue)' : 'var(--chip-border)'}`, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: sel ? 'var(--on-blue)' : 'var(--text)' }}>{g.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ borderRadius: 16, border: '1px dashed var(--chip-border)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)' }}>+ Add another goal</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 9999, border: '1px solid var(--chip-border)' }}>
            Coming soon
          </span>
        </div>
      </div>
    </Shell>
  );
};
