import React, { useState } from 'react';
import { Shell } from '../components/Shell';
import { GoalIcon, CheckIcon } from '../components/Icon';
import { useApp } from '../context/AppContext';
import { formatMoney } from '../lib/calc';
import { currencySymbol } from '../lib/currency';
import { goalCopy } from '../lib/goalTypes';

const CONFETTI_SEEDS: [number, string, string, 'blue' | 'ink'][] = [
  [10, '8%', '10%', 'blue'], [70, '16%', '85%', 'ink'], [30, '30%', '60%', 'blue'], [85, '42%', '25%', 'ink'],
  [15, '55%', '75%', 'blue'], [60, '65%', '15%', 'ink'], [40, '75%', '50%', 'blue'], [90, '85%', '35%', 'ink'],
  [20, '12%', '45%', 'blue'], [75, '50%', '90%', 'ink'], [5, '70%', '5%', 'blue'], [95, '20%', '65%', 'ink'],
];

interface Props {
  onBack: () => void;
}

export const Celebration: React.FC<Props> = ({ onBack }) => {
  const { state, markCelebrationSeen } = useApp();
  const goal = state.goal!;
  const symbol = currencySymbol(state.currency);
  const copy = goalCopy(goal.typeId, goal.name);
  const [shared, setShared] = useState<'idle' | 'shared' | 'copied'>('idle');

  React.useEffect(() => {
    markCelebrationSeen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shareWin = async () => {
    const text = `I just reached my ${goal.name} goal — ${formatMoney(goal.targetAmount, symbol)} saved, start to finish! 🎉`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        setShared('shared');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setShared('copied');
      }
    } catch {
      // user dismissed the native share sheet — not an error
    }
  };

  return (
    <Shell showBack onBack={onBack}>
      <div
        className="fade-in"
        style={{ padding: '70px 28px 60px', minHeight: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}
      >
        {CONFETTI_SEEDS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: s[1],
              top: s[2],
              width: 5 + (i % 3) * 2,
              height: 5 + (i % 3) * 2,
              borderRadius: 9999,
              background: s[3] === 'blue' ? 'var(--blue)' : 'var(--text)',
              animation: `floatY ${2.4 + (i % 4) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(i % 5) * 0.2}s`,
            }}
          />
        ))}

        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 9999,
            background: 'radial-gradient(120% 100% at 50% 50%, var(--blue-tint), transparent 65%), var(--card)',
            border: '1px solid var(--blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 0 36px var(--blue-shadow)',
          }}
        >
          <GoalIcon type={goal.typeId} size={goal.typeId === 'car' ? 90 : goal.typeId === 'travel' ? 60 : goal.typeId === 'phone' ? 42 : goal.typeId === 'gaming' ? 68 : goal.typeId === 'education' ? 58 : 54} color="var(--text)" />
        </div>
        <div style={{ fontSize: 29, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 6, position: 'relative', zIndex: 1 }}>
          You did it.
        </div>
        <div style={{ fontSize: 16, color: 'var(--blue)', fontWeight: 600, marginBottom: 8, position: 'relative', zIndex: 1 }}>{copy.celebrationSubline}</div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28, position: 'relative', zIndex: 1 }}>
          {formatMoney(goal.targetAmount, symbol)} saved, start to finish.
        </div>

        <div
          style={{
            width: 150,
            height: 266,
            borderRadius: 20,
            background: 'radial-gradient(120% 100% at 50% 0%, var(--blue-tint), transparent 60%), var(--card)',
            border: '1px solid var(--card-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 10,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 12px 28px rgba(0,0,0,0.3)',
          }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 9999, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckIcon color="var(--on-blue)" size={12} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', padding: '0 12px', textAlign: 'center' }}>{goal.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Goal reached</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--blue)' }}>{formatMoney(goal.targetAmount, symbol)}</div>
          <div style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Dreamsaver</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 24, position: 'relative', zIndex: 1 }}>Shareable story card — 9:16</div>

        <div
          onClick={shareWin}
          role="button"
          style={{ width: '100%', height: 52, borderRadius: 16, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 22px var(--blue-shadow)', cursor: 'pointer', position: 'relative', zIndex: 1 }}
        >
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-blue)' }}>
            {shared === 'copied' ? 'Copied to clipboard' : shared === 'shared' ? 'Shared!' : 'Share my win'}
          </span>
        </div>
      </div>
    </Shell>
  );
};
