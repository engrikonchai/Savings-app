import React from 'react';
import { Shell } from '../components/Shell';
import { GoalIcon, ChevronRight } from '../components/Icon';
import { EmptyState, SectionLabel } from '../components/ui';
import { PrimaryCTA } from '../components/PrimaryCTA';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import type { Goal } from '../lib/types';

interface Props {
  onBack: () => void;
  onAddGoal: () => void;
  onEditGoal: (goalId: string) => void;
  onViewGoal: (goalId: string) => void;
}

export const ManageGoals: React.FC<Props> = ({ onBack, onAddGoal, onEditGoal, onViewGoal }) => {
  const { state, totals, isDemoMode, selectGoal } = useApp();
  const symbol = currencySymbol(state.currency);
  const goals = state.goals;

  const view = (goal: Goal) => {
    selectGoal(goal.id);
    onViewGoal(goal.id);
  };

  return (
    <Shell showBack onBack={onBack} bottomSlot={!isDemoMode && <PrimaryCTA label="+ Add another goal" onClick={onAddGoal} variant="outline" />}>
      <div className="fade-in" style={{ padding: `104px 28px ${goals.length ? 130 : 40}px`, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 20 }}>Your goals</div>

        {goals.length === 0 ? (
          <EmptyState title="No goals yet" body="Create a goal to start tracking real progress toward it." />
        ) : (
          <>
            {goals.length > 1 && (
              <>
                <SectionLabel>All goals</SectionLabel>
                <div style={{ background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', borderRadius: 16, padding: 16, marginBottom: 26 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <span style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)' }}>{formatMoney(totals.saved, symbol)}</span>
                    <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 700 }}>{totals.pct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 9999, background: 'var(--card)', overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: `${totals.pct}%`, height: '100%', background: 'var(--blue)', borderRadius: 9999, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Total saved of {formatMoney(totals.target, symbol)} target across {goals.length} goals
                  </div>
                </div>
              </>
            )}

            <SectionLabel>{goals.length > 1 ? 'Each goal' : 'Active goal'}</SectionLabel>
            <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, overflow: 'hidden', marginBottom: 26 }}>
              {goals.map((goal, i) => {
                const pct = goal.targetAmount > 0 ? Math.min(100, Math.round((goal.currentSaved / goal.targetAmount) * 100)) : 0;
                const isSelected = state.goal?.id === goal.id;
                return (
                  <div
                    key={goal.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: 14,
                      borderBottom: i < goals.length - 1 ? '0.5px solid var(--divider)' : 'none',
                      background: isSelected && goals.length > 1 ? 'var(--blue-tint)' : 'transparent',
                    }}
                  >
                    <div
                      onClick={() => view(goal)}
                      role="button"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: `${goal.color}22`,
                        border: `1px solid ${goal.color}55`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                    >
                      <GoalIcon type={goal.typeId} size={20} color={goal.color} />
                    </div>
                    <div onClick={() => view(goal)} role="button" style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{goal.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {pct}% · {formatMoney(goal.currentSaved, symbol)} of {formatMoney(goal.targetAmount, symbol)}
                      </div>
                    </div>
                    {!isDemoMode && (
                      <div
                        onClick={() => onEditGoal(goal.id)}
                        role="button"
                        aria-label={`Edit ${goal.name}`}
                        style={{ width: 32, height: 32, borderRadius: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                      >
                        <ChevronRight color="var(--text-secondary)" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {isDemoMode && (
          <div style={{ borderRadius: 16, border: '1px dashed var(--chip-border)', padding: 16, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sign in to create and manage real goals.</span>
          </div>
        )}
      </div>
    </Shell>
  );
};
