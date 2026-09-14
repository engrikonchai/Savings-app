import React from 'react';
import { Shell } from '../components/Shell';
import { BrandMark, OlyviMark } from '../components/Icon';

export const LoadingScreen: React.FC<{ label?: string }> = ({ label = 'Loading…' }) => (
  <Shell>
    <div
      style={{
        minHeight: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div style={{ animation: 'floatSlow 1.6s ease-in-out infinite' }}>
        <BrandMark bg="var(--blue)" bar="var(--on-blue)" size={52} />
      </div>
      <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <div style={{ position: 'absolute', bottom: 40, display: 'flex', alignItems: 'center', gap: 5 }}>
        <OlyviMark size={11} color="var(--text-tertiary)" />
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.02em' }}>by OLYVI</span>
      </div>
    </div>
  </Shell>
);
