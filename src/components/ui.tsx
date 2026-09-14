import React from 'react';
import { GOAL_COLORS } from '../lib/goalColors';
import { CheckIcon } from './Icon';

export const SectionLabel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({
  children,
  style,
}) => (
  <div
    style={{
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: 12,
      ...style,
    }}
  >
    {children}
  </div>
);

interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  pill?: boolean;
  flex?: boolean;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onClick, pill = true, flex = false }) => (
  <div
    onClick={onClick}
    role="button"
    style={{
      flex: flex ? 1 : undefined,
      padding: pill ? '9px 15px' : '12px 0',
      textAlign: 'center',
      borderRadius: pill ? 9999 : 14,
      background: selected ? 'var(--blue)' : 'var(--chip-bg)',
      border: `1px solid ${selected ? 'var(--blue)' : 'var(--chip-border)'}`,
      cursor: 'pointer',
      flexShrink: pill ? 0 : undefined,
    }}
  >
    <span style={{ fontSize: pill ? 13 : 15, fontWeight: 600, color: selected ? 'var(--on-blue)' : 'var(--text)', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; tinted?: boolean }> = ({
  children,
  style,
  tinted,
}) => (
  <div
    style={{
      background: tinted ? 'var(--blue-tint)' : 'var(--card)',
      border: `1px solid ${tinted ? 'var(--blue-border)' : 'var(--card-border)'}`,
      borderRadius: 16,
      padding: 14,
      ...style,
    }}
  >
    {children}
  </div>
);

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

/** A row of accent-color swatches for a goal — cosmetic only (see lib/goalColors.ts), never
 * re-themes the app itself. */
export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 12 }}>
    {GOAL_COLORS.map((c) => {
      const selected = c === value;
      return (
        <div
          key={c}
          onClick={() => onChange(c)}
          role="button"
          aria-label={`Color ${c}`}
          style={{
            width: 34,
            height: 34,
            borderRadius: 9999,
            background: c,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: selected ? `0 0 0 2px var(--bg), 0 0 0 4px ${c}` : 'none',
            flexShrink: 0,
          }}
        >
          {selected && <CheckIcon color="#FFFFFF" size={13} />}
        </div>
      );
    })}
  </div>
);

export const EmptyState: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div style={{ textAlign: 'center', padding: '48px 8px' }}>
    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{title}</div>
    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{body}</div>
  </div>
);
