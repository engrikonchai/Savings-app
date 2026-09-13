import React from 'react';
import { Shell } from '../../components/Shell';
import { PrimaryCTA } from '../../components/PrimaryCTA';
import { GoalIcon } from '../../components/Icon';
import { Chip } from '../../components/ui';
import { formatMonthYear } from '../../lib/calc';
import type { GoalTypeId } from '../../lib/types';

export const StepProgress: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => (
  <>
    <div style={{ padding: '106px 28px 0', display: 'flex', gap: 6 }}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{ height: 4, borderRadius: 9999, flex: 1, background: n <= step ? 'var(--blue)' : 'var(--chip-bg)' }}
        />
      ))}
    </div>
    <div style={{ padding: '10px 28px 0', fontSize: 12, letterSpacing: '0.06em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
      {step} of 3
    </div>
  </>
);

interface Step1Props {
  typeId: GoalTypeId;
  typeLabel: string;
  photoPrompt: string;
  name: string;
  onChangeName: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const Step1: React.FC<Step1Props> = ({ typeId, typeLabel, photoPrompt, name, onChangeName, onBack, onContinue }) => (
  <Shell showBack onBack={onBack} bottomSlot={<PrimaryCTA label="Continue" onClick={onContinue} disabled={!name.trim()} />}>
    <StepProgress step={1} />
    <div className="fade-in" style={{ boxSizing: 'border-box', padding: '22px 28px 100px' }}>
      <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.15, color: 'var(--text)', marginBottom: 18 }}>
        What are we building toward?
      </div>
      <div
        style={{
          alignSelf: 'flex-start',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 16px',
          borderRadius: 9999,
          border: '1px solid var(--chip-border)',
          marginBottom: 20,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: 9999, background: 'var(--blue)' }} />
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{typeLabel}</span>
      </div>

      <div
        style={{
          height: 210,
          borderRadius: 24,
          background: 'radial-gradient(120% 100% at 50% 100%, var(--blue-tint), transparent 60%), var(--card)',
          border: '1px solid var(--card-border)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          marginBottom: 26,
          overflow: 'hidden',
        }}
      >
        {typeId === 'car' && (
          <svg width="140" height="46" viewBox="0 0 140 46" style={{ position: 'absolute', bottom: 16, opacity: 0.14 }}>
            <rect x="14" y="20" width="112" height="14" rx="7" fill="var(--text)" />
            <rect x="30" y="4" width="80" height="16" rx="8" fill="var(--text)" />
            <circle cx="38" cy="34" r="9" fill="var(--card)" />
            <circle cx="102" cy="34" r="9" fill="var(--card)" />
          </svg>
        )}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 9999,
            background: 'var(--blue-tint)',
            border: '1px solid var(--blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <GoalIcon type={typeId} size={24} color="var(--text)" />
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', position: 'relative', zIndex: 1 }}>{photoPrompt}</div>
      </div>

      <div>
        <div style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
          Your goal
        </div>
        <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Name your dream"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'transparent',
            border: 'none',
            borderBottom: '1.5px solid var(--blue)',
            paddingBottom: 10,
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: 'var(--text)',
            outline: 'none',
          }}
        />
      </div>
    </div>
  </Shell>
);

interface Step2Props {
  amount: number;
  current: number;
  onChangeAmount: (v: number) => void;
  onChangeCurrent: (v: number) => void;
  currencySymbol: string;
  onBack: () => void;
  onContinue: () => void;
}

export const Step2: React.FC<Step2Props> = ({ amount, current, onChangeAmount, onChangeCurrent, currencySymbol, onBack, onContinue }) => {
  const [amountFocused, setAmountFocused] = React.useState(false);
  const [currentFocused, setCurrentFocused] = React.useState(false);
  return (
    <Shell showBack onBack={onBack} bottomSlot={<PrimaryCTA label="Continue" onClick={onContinue} disabled={amount <= 0} />}>
      <StepProgress step={2} />
      <div className="fade-in" style={{ boxSizing: 'border-box', padding: '22px 28px 100px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.15, color: 'var(--text)', marginBottom: 8 }}>
          What does it cost?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 40 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, borderBottom: '1.5px dashed var(--divider)', paddingBottom: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: 'var(--text)' }}>{currencySymbol}</span>
            <input
              value={amountFocused ? String(amount || '') : amount.toLocaleString('en-US')}
              onChange={(e) => onChangeAmount(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              inputMode="numeric"
              style={{ width: 230, background: 'transparent', border: 'none', fontSize: 56, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', outline: 'none' }}
            />
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>Tap to edit</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, color: 'var(--text-secondary)', fontSize: 16, marginTop: 12 }}>
            <span>I already have {currencySymbol}</span>
            <input
              value={currentFocused ? String(current || '') : current.toLocaleString('en-US')}
              onChange={(e) => onChangeCurrent(parseInt(e.target.value.replace(/[^0-9]/g, ''), 10) || 0)}
              onFocus={() => setCurrentFocused(true)}
              onBlur={() => setCurrentFocused(false)}
              inputMode="numeric"
              style={{ width: 70, background: 'transparent', border: 'none', borderBottom: '1px solid var(--divider)', fontSize: 16, fontWeight: 600, color: 'var(--text)', outline: 'none', paddingBottom: 2 }}
            />
          </div>
          <div style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: 220 }}>
            Start where you are — every euro counts.
          </div>
        </div>
      </div>
    </Shell>
  );
};

interface Step3Props {
  today: Date;
  monthIndex: number;
  onChangeMonthIndex: (i: number) => void;
  weeklyLabel: string;
  targetLabel: string;
  onBack: () => void;
  onFinish: () => void;
  submitting?: boolean;
  error?: string | null;
}

export function monthOptionDate(today: Date, monthsAhead: number): Date {
  return new Date(today.getFullYear(), today.getMonth() + monthsAhead, 15);
}

export const Step3: React.FC<Step3Props> = ({ today, monthIndex, onChangeMonthIndex, weeklyLabel, targetLabel, onBack, onFinish, submitting, error }) => {
  const options = Array.from({ length: 18 }, (_, i) => monthOptionDate(today, i + 1));
  return (
    <Shell
      showBack
      onBack={onBack}
      bottomSlot={<PrimaryCTA label={submitting ? 'Creating…' : 'Start building my goal'} onClick={onFinish} disabled={submitting} />}
    >
      <StepProgress step={3} />
      <div className="fade-in" style={{ boxSizing: 'border-box', padding: '22px 0 100px' }}>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.15, color: 'var(--text)', marginBottom: 18, padding: '0 28px' }}>
          When do you want it?
        </div>
        {error && (
          <div style={{ margin: '0 28px 18px', background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '10px 14px' }}>
            <span style={{ fontSize: 13, color: 'var(--negative)', fontWeight: 500 }}>{error}</span>
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '0 28px 6px', marginBottom: 26 }}>
          {options.map((d, i) => (
            <Chip key={i} label={formatMonthYear(d)} selected={i === monthIndex} onClick={() => onChangeMonthIndex(i)} />
          ))}
          <div style={{ flexShrink: 0, width: 16 }} />
        </div>
        <div style={{ borderRadius: 20, background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', padding: 20, margin: '0 28px' }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.005em', color: 'var(--text)', lineHeight: 1.4 }}>
            Save {weeklyLabel}/week to reach it by {targetLabel}.
          </div>
        </div>
      </div>
    </Shell>
  );
};

interface SuccessProps {
  goalName: string;
  weeklyLabel: string;
  targetLabel: string;
  onDone: () => void;
}

export const CreateSuccess: React.FC<SuccessProps> = ({ goalName, weeklyLabel, targetLabel, onDone }) => (
  <div
    className="fade-in"
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 40,
      background: 'var(--overlay-bg)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
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
    <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 10 }}>
      Your goal is live.
    </div>
    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 28, maxWidth: 300 }}>
      Every euro from here goes toward {goalName} — save {weeklyLabel}/week to get there by {targetLabel}.
    </div>
    <div
      onClick={onDone}
      role="button"
      style={{ padding: '10px 20px', borderRadius: 9999, border: '1px solid var(--chip-border)', cursor: 'pointer' }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Go to my dashboard</span>
    </div>
  </div>
);
