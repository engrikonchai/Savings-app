import React from 'react';
import { Shell } from '../components/Shell';
import { BottomNav, type TabName } from '../components/BottomNav';
import { GoalIcon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { computePace, formatMonthYear, formatMoney } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import { NAV_HEIGHT } from '../lib/layout';

const CIRCUMFERENCE = 540.4;

interface Props {
  onNavigate: (tab: TabName) => void;
  onAddMoney: () => void;
  onDreamDays: () => void;
  onPreviewCelebration: () => void;
  onCelebrate: () => void;
}

export const Dashboard: React.FC<Props> = ({ onNavigate, onAddMoney, onDreamDays, onPreviewCelebration, onCelebrate }) => {
  const { state, today } = useApp();
  const goal = state.goal!;
  const pace = computePace(goal, today);
  const symbol = currencySymbol(state.currency);
  const ringOffset = (CIRCUMFERENCE * (1 - pace.pct / 100)).toFixed(1);
  const isComplete = pace.pct >= 100;
  const targetLabel = formatMonthYear(new Date(goal.predictedDate));
  const recent = state.transactions.slice(0, 3);

  return (
    <Shell showWordmark bottomSlot={<BottomNav active="dashboard" onNavigate={onNavigate} />}>
      <div className="fade-in" style={{ padding: `110px 28px ${NAV_HEIGHT + 54}px`, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 4 }}>
          Your goal
        </div>
        <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 26 }}>{goal.name}</div>

        <div style={{ position: 'relative', width: 196, height: 196, margin: '0 auto 22px' }}>
          <svg width="196" height="196" viewBox="0 0 196 196" style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
            <circle cx="98" cy="98" r="86" fill="none" stroke="var(--chip-bg)" strokeWidth="10" />
            <circle
              cx="98"
              cy="98"
              r="86"
              fill="none"
              stroke="var(--blue)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ringOffset}
              style={{ filter: 'drop-shadow(0 0 8px var(--blue-shadow))', transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 16,
              borderRadius: 9999,
              overflow: 'hidden',
              background: 'radial-gradient(120% 100% at 50% 100%, var(--blue-tint), transparent 60%), var(--card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <GoalIcon type={goal.typeId} size={goal.typeId === 'travel' ? 46 : goal.typeId === 'custom' ? 38 : goal.typeId === 'phone' ? 30 : goal.typeId === 'education' ? 44 : goal.typeId === 'gaming' ? 52 : 82} color="var(--text)" opacity={0.5} />
            <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginTop: 4 }}>{pace.pct}%</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{formatMoney(goal.currentSaved, symbol)}</span>
          <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}> of {formatMoney(goal.targetAmount, symbol)}</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--blue)', marginBottom: 24 }}>
          {isComplete ? 'Goal complete!' : `You're ${formatMoney(pace.remaining, symbol)} away`}
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Predicted date</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{targetLabel}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 4 }}>Weekly target</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{formatMoney(pace.weekly, symbol)}/week</div>
          </div>
        </div>

        {isComplete ? (
          <div
            onClick={onCelebrate}
            role="button"
            style={{
              height: 54,
              borderRadius: 16,
              background: 'var(--blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 22px var(--blue-shadow)',
              cursor: 'pointer',
              marginBottom: 30,
            }}
          >
            <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--on-blue)' }}>View your celebration</span>
          </div>
        ) : (
          <>
            <div
              onClick={onAddMoney}
              role="button"
              style={{
                height: 54,
                borderRadius: 16,
                background: 'var(--blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 22px var(--blue-shadow)',
                cursor: 'pointer',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--on-blue)' }}>Add money</span>
            </div>
            <div
              onClick={onDreamDays}
              role="button"
              style={{
                height: 50,
                borderRadius: 16,
                border: '1px solid var(--chip-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginBottom: 30,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Should I buy it?</span>
            </div>
          </>
        )}

        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
          Recent activity
        </div>
        {recent.length === 0 ? (
          <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '28px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Nothing yet. Add your first contribution to see it here.
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, overflow: 'hidden' }}>
            {recent.map((a, i) => {
              const positive = a.kind !== 'purchase';
              const dotColor = a.kind === 'purchase' ? 'var(--text-secondary)' : 'var(--blue)';
              const amountColor = a.kind === 'purchase' ? 'var(--negative)' : 'var(--blue)';
              const dateLabel = new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const daysLabel = a.daysDelta !== 0 ? ` · ${a.daysDelta > 0 ? '+' : ''}${a.daysDelta.toFixed(1)} days` : '';
              return (
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderBottom: i < recent.length - 1 ? '0.5px solid var(--divider)' : 'none',
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: 9999, background: dotColor, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {dateLabel}
                      {daysLabel}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: amountColor }}>
                    {positive ? '+' : '-'}
                    {formatMoney(a.amount, symbol)}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isComplete && (
          <div onClick={onPreviewCelebration} role="button" style={{ textAlign: 'center', marginTop: 26, fontSize: 12, color: 'var(--text-tertiary)', cursor: 'pointer' }}>
            Preview: goal completed
          </div>
        )}
      </div>
    </Shell>
  );
};
