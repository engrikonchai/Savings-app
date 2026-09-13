import React from 'react';
import { BackChevron, BrandMark } from './Icon';
import { pt, TOPBAR_TOP } from '../lib/layout';

interface Props {
  showBack?: boolean;
  onBack?: () => void;
  showWordmark?: boolean;
}

/** The persistent top bar: back chevron (contextual), wordmark on tab screens, brand mark
 * always. Absolutely positioned so scrolling content passes underneath it, never over it. */
export const TopBar: React.FC<Props> = ({ showBack, onBack, showWordmark }) => (
  <>
    {showBack && (
      <div
        onClick={onBack}
        role="button"
        aria-label="Back"
        style={{
          position: 'absolute',
          top: pt(TOPBAR_TOP),
          left: 16,
          zIndex: 30,
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: 'var(--chip-bg)',
          border: '0.5px solid var(--chip-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <BackChevron color="var(--text)" />
      </div>
    )}
    {showWordmark && (
      <div
        style={{
          position: 'absolute',
          top: pt(TOPBAR_TOP + 8),
          left: 20,
          zIndex: 30,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: '-0.01em',
          color: 'var(--text)',
        }}
      >
        [APP NAME]
      </div>
    )}
    <div style={{ position: 'absolute', top: pt(TOPBAR_TOP + 2), right: 16, zIndex: 30 }}>
      <BrandMark bg="var(--blue)" bar="var(--on-blue)" />
    </div>
  </>
);
