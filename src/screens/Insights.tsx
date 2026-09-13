import React from 'react';
import { Shell } from '../components/Shell';
import { BottomNav, type TabName } from '../components/BottomNav';
import { useApp } from '../context/AppContext';
import { computePace, formatMonthYear, formatMoney, DAY_NAMES_FULL, startOfDay } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import { NAV_HEIGHT } from '../lib/layout';
import type { Transaction } from '../lib/types';

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Monday-first, matches the week grid below
const DAY_FULL_MON_FIRST = [DAY_NAMES_FULL[1], DAY_NAMES_FULL[2], DAY_NAMES_FULL[3], DAY_NAMES_FULL[4], DAY_NAMES_FULL[5], DAY_NAMES_FULL[6], DAY_NAMES_FULL[0]];

function mondayOf(d: Date): Date {
  const day = d.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // days since Monday
  const r = startOfDay(d);
  r.setDate(r.getDate() - diff);
  return r;
}

function weekKey(d: Date): string {
  const m = mondayOf(d);
  return m.toISOString().slice(0, 10);
}

interface Props {
  onNavigate: (tab: TabName) => void;
}

export const Insights: React.FC<Props> = ({ onNavigate }) => {
  const { state, today } = useApp();
  const symbol = currencySymbol(state.currency);
  const goal = state.goal!;
  const pace = computePace(goal, today);
  const targetLabel = formatMonthYear(new Date(goal.predictedDate));

  const savingsTxs: Transaction[] = state.transactions.filter((t) => t.kind !== 'purchase');

  // Current Monday-Sun week, per-day totals for the bar chart.
  const monday = mondayOf(today);
  const weekVals = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(day.getDate() + i);
    return savingsTxs
      .filter((t) => startOfDay(new Date(t.date)).getTime() === day.getTime())
      .reduce((sum, t) => sum + t.amount, 0);
  });
  const maxWeekVal = Math.max(1, ...weekVals);
  const bestIdx = weekVals.indexOf(Math.max(...weekVals));
  const hasAnyThisWeek = weekVals.some((v) => v > 0);

  // All-time weekly aggregation for best/average week.
  const byWeek = new Map<string, number>();
  savingsTxs.forEach((t) => {
    const key = weekKey(new Date(t.date));
    byWeek.set(key, (byWeek.get(key) ?? 0) + t.amount);
  });
  const weekTotals = Array.from(byWeek.values());
  const bestWeekTotal = weekTotals.length ? Math.max(...weekTotals) : 0;
  const avgWeekTotal = weekTotals.length ? Math.round(weekTotals.reduce((a, b) => a + b, 0) / weekTotals.length) : 0;

  // Per-weekday average across all history, to power the "your move this week" tip.
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  const dayWeekSets: Set<string>[] = [new Set(), new Set(), new Set(), new Set(), new Set(), new Set(), new Set()];
  savingsTxs.forEach((t) => {
    const d = new Date(t.date);
    const idx = (d.getDay() + 6) % 7; // Monday-first index
    dayTotals[idx] += t.amount;
    dayWeekSets[idx].add(weekKey(d));
  });
  const dayAverages = dayTotals.map((sum, i) => (dayWeekSets[i].size ? sum / dayWeekSets[i].size : 0));
  const bestDayIdx = dayAverages.indexOf(Math.max(...dayAverages));
  const hasHistory = savingsTxs.length > 0;

  const actionInsight = hasHistory && dayAverages[bestDayIdx] > 0
    ? `You save most on ${DAY_FULL_MON_FIRST[bestDayIdx]}s — about ${formatMoney(dayAverages[bestDayIdx], symbol)} on average. Automate a ${formatMoney(pace.weekly, symbol)} transfer every ${DAY_FULL_MON_FIRST[bestDayIdx]} and you'll stay ahead of pace without thinking about it.`
    : `Add a few contributions and we'll tell you which day you save best on — then help you automate around it.`;

  return (
    <Shell showWordmark bottomSlot={<BottomNav active="insights" onNavigate={onNavigate} />}>
      <div className="fade-in" style={{ padding: `104px 28px ${NAV_HEIGHT + 34}px`, boxSizing: 'border-box' }}>
        <div style={{ fontSize: 25, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 22 }}>Insights</div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, marginBottom: 8, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: '16px 14px 12px' }}>
          {weekVals.map((v, i) => {
            const h = hasAnyThisWeek ? Math.max(4, Math.round((v / maxWeekVal) * 82)) : 4;
            const isBest = hasAnyThisWeek && i === bestIdx && v > 0;
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ width: '100%', borderRadius: 6, background: isBest ? 'var(--blue)' : 'var(--blue-tint)', height: h }} />
                <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{DAY_LETTERS[i]}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '18px 0' }}>
          <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Best saving week</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{formatMoney(bestWeekTotal, symbol)}</div>
          </div>
          <div style={{ flex: 1, background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Average / week</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{formatMoney(avgWeekTotal, symbol)}</div>
          </div>
        </div>

        <div style={{ borderRadius: 20, background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Your move this week
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text)', lineHeight: 1.4 }}>{actionInsight}</div>
        </div>

        <div style={{ borderRadius: 16, border: '1px solid var(--card-border)', padding: 16 }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            At this pace, you'll reach your goal on <span style={{ color: 'var(--text)', fontWeight: 600 }}>{targetLabel}</span>.
          </div>
        </div>
      </div>
    </Shell>
  );
};
