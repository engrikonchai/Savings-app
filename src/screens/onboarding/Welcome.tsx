import React from 'react';
import { Shell } from '../../components/Shell';
import { PrimaryCTA } from '../../components/PrimaryCTA';

export const Welcome: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <Shell
    bottomSlot={<PrimaryCTA label="Start my goal" onClick={onStart} />}
  >
    <div
      className="fade-in"
      style={{
        boxSizing: 'border-box',
        minHeight: '100%',
        padding: '120px 32px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 92, height: 92, marginBottom: 30 }}>
        <div
          style={{
            position: 'absolute',
            inset: -18,
            borderRadius: 9999,
            background: 'radial-gradient(circle, var(--blue-tint), transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 26,
            background: 'var(--blue)',
            boxShadow: '0 10px 28px var(--blue-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            animation: 'floatSlow 3.4s ease-in-out infinite',
          }}
        >
          <div style={{ width: 10, height: 22, borderRadius: 5, background: 'var(--on-blue)' }} />
          <div style={{ width: 10, height: 38, borderRadius: 5, background: 'var(--on-blue)' }} />
          <div style={{ width: 10, height: 54, borderRadius: 5, background: 'var(--on-blue)' }} />
        </div>
      </div>
      <div style={{ fontSize: 29, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2, color: 'var(--text)', marginBottom: 14 }}>
        Every euro moves your dream closer.
      </div>
      <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 280, marginBottom: 44 }}>
        Save for what matters. See the date get closer.
      </div>

      <div style={{ width: '100%', maxWidth: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 9999, background: 'var(--text-tertiary)', flexShrink: 0 }} />
          <div style={{ flex: 1, height: 1, borderTop: '1.5px dashed var(--divider)' }} />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: 'var(--blue)',
              boxShadow: '0 0 10px var(--blue-shadow)',
              flexShrink: 0,
            }}
          />
        </div>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>
          <span>Today</span>
          <span style={{ color: 'var(--blue)', fontWeight: 600 }}>Dream date</span>
        </div>
      </div>
    </div>
  </Shell>
);
