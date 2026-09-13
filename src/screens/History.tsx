import React from 'react';
import { Shell } from '../components/Shell';
import { BottomNav, type TabName } from '../components/BottomNav';
import { EmptyState } from '../components/ui';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import { NAV_HEIGHT } from '../lib/layout';

interface Props {
  onNavigate: (tab: TabName) => void;
}

export const History: React.FC<Props> = ({ onNavigate }) => {
  const { state, today } = useApp();
  const symbol = currencySymbol(state.currency);
  const txs = state.transactions;

  const thisMonth = txs.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  });
  const monthTotal = thisMonth.filter((t) => t.kind !== 'purchase').reduce((sum, t) => sum + t.amount, 0);
  const skippedCount = thisMonth.filter((t) => t.kind === 'skip').length;
  const boughtCount = thisMonth.filter((t) => t.kind === 'purchase').length;
  const summaryParts: string[] = [];
  if (skippedCount > 0) summaryParts.push(`${skippedCount} skipped`);
  if (boughtCount > 0) summaryParts.push(`${boughtCount} bought`);

  return (
    <Shell showWordmark bottomSlot={<BottomNav active="history" onNavigate={onNavigate} />}>
      <div className="fade-in" style={{ padding: `104px 28px ${NAV_HEIGHT + 34}px`, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 20 }}>History</div>

        <div style={{ background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', borderRadius: 16, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--blue)', marginBottom: 2 }}>This month</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text)' }}>
              {monthTotal >= 0 ? '+' : ''}
              {formatMoney(monthTotal, symbol)}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right' }}>
            {summaryParts.length ? summaryParts.map((p, i) => <div key={i}>{p}</div>) : <div>No purchases logged</div>}
          </div>
        </div>

        {txs.length === 0 ? (
          <EmptyState title="No activity yet" body="Add money or log a Dream Days decision and it'll show up here." />
        ) : (
          <div style={{ position: 'relative', paddingLeft: 18 }}>
            <div style={{ position: 'absolute', left: 3, top: 6, bottom: 6, width: 1, background: 'var(--divider)' }} />
            {txs.map((h, i) => {
              const dotColor = h.kind === 'purchase' ? 'var(--text-secondary)' : 'var(--blue)';
              const amountColor = h.kind === 'purchase' ? 'var(--text)' : 'var(--blue)';
              const dateLabel = new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const daysColor = h.daysDelta >= 0 ? 'var(--blue)' : 'var(--negative)';
              return (
                <div key={h.id} style={{ position: 'relative', paddingBottom: i === txs.length - 1 ? 0 : 22 }}>
                  <div style={{ position: 'absolute', left: -18, top: 4, width: 9, height: 9, borderRadius: 9999, background: dotColor, boxShadow: '0 0 0 3px var(--bg)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{h.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: amountColor }}>
                      {h.kind === 'purchase' ? '-' : '+'}
                      {formatMoney(h.amount, symbol)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dateLabel}</span>
                    {h.daysDelta !== 0 && (
                      <span style={{ fontSize: 12, fontWeight: 600, color: daysColor }}>
                        {h.daysDelta > 0 ? '+' : ''}
                        {h.daysDelta.toFixed(1)} days
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
};
