import React, { useState } from 'react';
import { Shell } from '../components/Shell';
import { BottomNav, type TabName } from '../components/BottomNav';
import { BrandMark, ChevronRight } from '../components/Icon';
import { SectionLabel, Chip } from '../components/ui';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CURRENCIES } from '../lib/currency';
import type { ThemeMode } from '../lib/types';
import { NAV_HEIGHT } from '../lib/layout';

interface Props {
  onNavigate: (tab: TabName) => void;
  onManageGoals: () => void;
  onEditGoal: () => void;
  onSignIn: () => void;
}

export const Profile: React.FC<Props> = ({ onNavigate, onManageGoals, onEditGoal, onSignIn }) => {
  const { state, isDemoMode, toggleNotif, setThemeMode, setCurrency, setProfileName } = useApp();
  const { user, signOut } = useAuth();
  const goal = state.goal!;
  const [showCurrency, setShowCurrency] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(state.profileName);

  const modes: { id: ThemeMode; label: string }[] = [
    { id: 'system', label: 'System' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ];

  return (
    <Shell showWordmark bottomSlot={<BottomNav active="profile" onNavigate={onNavigate} />}>
      <div className="fade-in" style={{ padding: `104px 28px ${NAV_HEIGHT + 34}px`, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 30 }}>
          <BrandMark bg="var(--blue)" bar="var(--on-blue)" size={52} />
          <div style={{ minWidth: 0, flex: 1 }}>
            {editingName ? (
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onBlur={() => {
                  setProfileName(nameDraft.trim() || 'You');
                  setEditingName(false);
                }}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--blue)', outline: 'none', width: '100%' }}
              />
            ) : (
              <div onClick={() => setEditingName(true)} role="button" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', cursor: 'pointer' }}>
                {state.profileName}
              </div>
            )}
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {isDemoMode ? `Previewing · Saving for ${goal.name}` : `Saving for ${goal.name}`}
            </div>
          </div>
        </div>

        {isDemoMode ? (
          <div
            onClick={onSignIn}
            role="button"
            style={{ background: 'var(--blue-tint)', border: '1px solid var(--blue-border)', borderRadius: 16, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>You're previewing a demo</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Sign in to save your real goal to the cloud</div>
            </div>
            <ChevronRight color="var(--blue)" />
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>Signed in as {user?.email}</div>
        )}

        <div style={{ background: 'var(--card)', border: '1px solid var(--card-border)', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
          <Row label="Manage goals" onClick={onManageGoals} />
          <Row label="Edit goal" onClick={onEditGoal} />
          <div style={{ borderBottom: '0.5px solid var(--divider)' }}>
            <Row
              label="Change currency"
              value={`${state.currency} (${CURRENCIES.find((c) => c.code === state.currency)?.symbol})`}
              onClick={() => setShowCurrency((v) => !v)}
              noBorder
            />
            {showCurrency && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 16px 16px' }}>
                {CURRENCIES.map((c) => (
                  <Chip
                    key={c.code}
                    label={`${c.symbol} ${c.code}`}
                    selected={c.code === state.currency}
                    onClick={() => {
                      setCurrency(c.code);
                      setShowCurrency(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: isDemoMode ? 'none' : '0.5px solid var(--divider)' }}>
            <span style={{ fontSize: 15, color: 'var(--text)' }}>Notifications</span>
            <div
              onClick={toggleNotif}
              role="button"
              style={{ width: 44, height: 26, borderRadius: 9999, background: state.notifEnabled ? 'var(--blue)' : 'var(--chip-bg)', position: 'relative', cursor: 'pointer', transition: 'background 0.15s' }}
            >
              <div style={{ position: 'absolute', top: 2, left: state.notifEnabled ? 20 : 2, width: 22, height: 22, borderRadius: 9999, background: '#FFFFFF', transition: 'left 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
          {!isDemoMode && (
            <div onClick={() => signOut()} role="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, cursor: 'pointer' }}>
              <span style={{ fontSize: 15, color: 'var(--negative)', fontWeight: 600 }}>Log out</span>
            </div>
          )}
        </div>

        <SectionLabel>Appearance</SectionLabel>
        <div style={{ display: 'flex', background: 'var(--chip-bg)', borderRadius: 12, padding: 3, marginBottom: 8 }}>
          {modes.map((m) => {
            const active = state.themeMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setThemeMode(m.id)}
                role="button"
                style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 9, background: active ? 'var(--card)' : 'transparent', cursor: 'pointer' }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: active ? 'var(--text)' : 'var(--text-secondary)' }}>{m.label}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Follows your iPhone's appearance unless you override it.</div>
      </div>
    </Shell>
  );
};

const Row: React.FC<{ label: string; value?: string; onClick: () => void; noBorder?: boolean }> = ({ label, value, onClick, noBorder }) => (
  <div
    onClick={onClick}
    role="button"
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottom: noBorder ? 'none' : '0.5px solid var(--divider)', cursor: 'pointer' }}
  >
    <span style={{ fontSize: 15, color: 'var(--text)' }}>{label}</span>
    {value ? <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{value}</span> : <ChevronRight color="var(--text-secondary)" />}
  </div>
);
