import React from 'react';
import { pb } from '../lib/layout';

interface Props {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'filled' | 'outline';
  style?: React.CSSProperties;
}

export const PrimaryCTA: React.FC<Props> = ({ label, onClick, disabled, variant = 'filled', style }) => {
  const filled = variant === 'filled';
  return (
    <div
      onClick={disabled ? undefined : onClick}
      role="button"
      aria-disabled={disabled}
      style={{
        position: 'absolute',
        left: 28,
        right: 28,
        bottom: pb(28),
        zIndex: 30,
        height: filled ? 54 : 50,
        borderRadius: 16,
        background: filled ? 'var(--blue)' : 'transparent',
        border: filled ? 'none' : '1px solid var(--chip-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: filled ? '0 8px 22px var(--blue-shadow)' : 'none',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
    >
      <span style={{ fontSize: filled ? 17 : 15, fontWeight: 700, color: filled ? 'var(--on-blue)' : 'var(--text)' }}>
        {label}
      </span>
    </div>
  );
};

interface TwoChoiceProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}

export const TwoChoiceBar: React.FC<TwoChoiceProps> = ({ primaryLabel, onPrimary, secondaryLabel, onSecondary }) => (
  <div
    style={{
      position: 'absolute',
      left: 28,
      right: 28,
      bottom: pb(28),
      zIndex: 30,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <div
      onClick={onPrimary}
      role="button"
      style={{
        height: 52,
        borderRadius: 16,
        background: 'var(--blue)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 22px var(--blue-shadow)',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-blue)' }}>{primaryLabel}</span>
    </div>
    <div
      onClick={onSecondary}
      role="button"
      style={{
        height: 50,
        borderRadius: 16,
        border: '1px solid var(--chip-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{secondaryLabel}</span>
    </div>
  </div>
);
