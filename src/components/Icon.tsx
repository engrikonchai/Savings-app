import React from 'react';
import type { GoalTypeId } from '../lib/types';

interface GoalIconProps {
  type: GoalTypeId;
  size?: number;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
}

/** Goal-type glyphs, paths lifted directly from the design so every screen (dashboard ring,
 * choose-goal cards, manage-goals rows, celebration) renders the same mark. */
export const GoalIcon: React.FC<GoalIconProps> = ({ type, size = 22, color = 'currentColor', strokeWidth = 1.6, opacity = 1 }) => {
  const common = { fill: 'none' as const, stroke: color, strokeWidth, style: { opacity } };
  switch (type) {
    case 'car':
      return (
        <svg width={size} height={(size * 16) / 26} viewBox="0 0 26 16" {...common}>
          <rect x="1" y="5" width="24" height="7" rx="3" />
          <path d="M5 5L6.5 1.5H19.5L21 5" strokeLinejoin="round" />
          <circle cx="7" cy="12.5" r="2.6" />
          <circle cx="19" cy="12.5" r="2.6" />
        </svg>
      );
    case 'travel':
      return (
        <svg width={size} height={(size * 20) / 22} viewBox="0 0 22 20" {...common}>
          <path d="M20 1L2 9.5L9.5 12L12.5 20L20 1Z" strokeLinejoin="round" />
        </svg>
      );
    case 'phone':
      return (
        <svg width={size} height={(size * 22) / 16} viewBox="0 0 16 22" {...common}>
          <rect x="1" y="1" width="14" height="20" rx="2.5" />
          <line x1="5.5" y1="17" x2="10.5" y2="17" strokeLinecap="round" />
        </svg>
      );
    case 'gaming':
      return (
        <svg width={size} height={(size * 16) / 26} viewBox="0 0 26 16" {...common}>
          <rect x="1" y="1" width="24" height="14" rx="7" />
          <path d="M6.5 5V11M3.5 8H9.5" strokeLinecap="round" strokeWidth={strokeWidth * 0.85} />
          <circle cx="19" cy="6" r="1.2" strokeWidth={strokeWidth * 0.85} />
          <circle cx="19" cy="10" r="1.2" strokeWidth={strokeWidth * 0.85} />
        </svg>
      );
    case 'education':
      return (
        <svg width={size} height={(size * 18) / 24} viewBox="0 0 24 18" {...common}>
          <path d="M12 1L23 6.5L12 12L1 6.5L12 1Z" strokeLinejoin="round" />
          <path d="M6 8.5V12.5C6 12.5 9 14.5 12 14.5C15 14.5 18 12.5 18 12.5V8.5" />
        </svg>
      );
    case 'custom':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 22 22" {...common}>
          <path d="M11 1L14 8L21 9L15.5 13.5L17 20.5L11 17L5 20.5L6.5 13.5L1 9L8 8L11 1Z" strokeLinejoin="round" />
        </svg>
      );
  }
};

export const BackChevron: React.FC<{ color?: string; size?: number }> = ({ color = 'currentColor', size = 17 }) => (
  <svg width={(size * 10) / 17} height={size} viewBox="0 0 10 17" fill="none">
    <path d="M8.5 1.5L1.5 8.5l7 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ChevronRight: React.FC<{ color?: string }> = ({ color = 'currentColor' }) => (
  <svg width="8" height="14" viewBox="0 0 8 14">
    <path d="M1 1l6 6-6 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CheckIcon: React.FC<{ color?: string; size?: number }> = ({ color = 'currentColor', size = 18 }) => (
  <svg width={(size * 26) / 18} height={size} viewBox="0 0 26 20" fill="none">
    <path d="M2 10L10 18L24 2" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const BrandMark: React.FC<{ size?: number; bg: string; bar: string }> = ({ size = 32, bg, bar }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      boxShadow: `0 2px 8px var(--blue-shadow)`,
      flexShrink: 0,
    }}
  >
    <div style={{ width: 4, height: size * 0.25, borderRadius: 2, background: bar }} />
    <div style={{ width: 4, height: size * 0.44, borderRadius: 2, background: bar }} />
    <div style={{ width: 4, height: size * 0.62, borderRadius: 2, background: bar }} />
  </div>
);

export const NavHomeIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="20" height="19" viewBox="0 0 20 19">
    <path d="M2 8L10 1L18 8V17C18 17.6 17.6 18 17 18H12V12H8V18H3C2.4 18 2 17.6 2 17V8Z" fill={color} />
  </svg>
);

export const NavHistoryIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1.6" fill="none" />
    <path d="M10 5.5V10L13.5 12" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);

export const NavInsightsIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="20" height="18" viewBox="0 0 20 18">
    <rect x="1" y="10" width="4" height="7" rx="1" fill={color} />
    <rect x="8" y="5" width="4" height="12" rx="1" fill={color} />
    <rect x="15" y="0" width="4" height="17" rx="1" fill={color} />
  </svg>
);

export const NavProfileIcon: React.FC<{ color: string }> = ({ color }) => (
  <svg width="18" height="19" viewBox="0 0 18 19">
    <circle cx="9" cy="5" r="4.2" fill={color} />
    <path d="M1 18C1 13.5 4.5 11 9 11C13.5 11 17 13.5 17 18" fill={color} />
  </svg>
);
