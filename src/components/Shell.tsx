import React from 'react';
import { TopBar } from './TopBar';

interface Props {
  showBack?: boolean;
  onBack?: () => void;
  showWordmark?: boolean;
  children: React.ReactNode;
  /** Fixed bottom overlay(s) — CTA bar, two-choice bar, bottom nav — rendered above content. */
  bottomSlot?: React.ReactNode;
}

/** Full-viewport app shell. No decorative phone bezel — this is the real, responsive app,
 * sized to whatever viewport it runs in (tested at 375 / 390 / 430px) and safe-area aware
 * so real iOS chrome (Dynamic Island, home indicator) never overlaps content. */
export const Shell: React.FC<Props> = ({ showBack, onBack, showWordmark, children, bottomSlot }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      paddingLeft: 'var(--safe-left)',
      paddingRight: 'var(--safe-right)',
    }}
  >
    <TopBar showBack={showBack} onBack={onBack} showWordmark={showWordmark} />
    <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', position: 'relative' }}>
      {children}
    </div>
    {bottomSlot}
  </div>
);
