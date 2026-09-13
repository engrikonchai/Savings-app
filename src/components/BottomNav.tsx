import React from 'react';
import { NavHistoryIcon, NavHomeIcon, NavInsightsIcon, NavProfileIcon } from './Icon';
import { pb } from '../lib/layout';

export type TabName = 'dashboard' | 'history' | 'insights' | 'profile';

interface Props {
  active: TabName;
  onNavigate: (tab: TabName) => void;
}

export const BottomNav: React.FC<Props> = ({ active, onNavigate }) => {
  const items: { key: TabName; label: string; Icon: React.FC<{ color: string }> }[] = [
    { key: 'dashboard', label: 'Home', Icon: NavHomeIcon },
    { key: 'history', label: 'History', Icon: NavHistoryIcon },
    { key: 'insights', label: 'Insights', Icon: NavInsightsIcon },
    { key: 'profile', label: 'Profile', Icon: NavProfileIcon },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: `10px 8px ${pb(18)}`,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderTop: '0.5px solid var(--divider)',
      }}
    >
      {items.map(({ key, label, Icon }) => {
        const color = active === key ? 'var(--blue)' : 'var(--text-secondary)';
        return (
          <div
            key={key}
            onClick={() => onNavigate(key)}
            role="button"
            aria-label={label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              cursor: 'pointer',
              padding: '4px 10px',
              minWidth: 52,
            }}
          >
            <Icon color={color} />
            <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
          </div>
        );
      })}
    </div>
  );
};
