import React from 'react';
import { Shell } from '../../components/Shell';
import { PrimaryCTA } from '../../components/PrimaryCTA';
import { GoalIcon } from '../../components/Icon';
import { GOAL_TYPES } from '../../lib/goalTypes';
import type { GoalTypeId } from '../../lib/types';

interface Props {
  selected: GoalTypeId;
  onSelect: (id: GoalTypeId) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const ChooseGoalType: React.FC<Props> = ({ selected, onSelect, onBack, onContinue }) => (
  <Shell showBack onBack={onBack} bottomSlot={<PrimaryCTA label="Continue" onClick={onContinue} />}>
    <div className="fade-in" style={{ boxSizing: 'border-box', padding: '106px 28px 130px' }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.2, color: 'var(--text)', marginBottom: 24 }}>
        What are you building toward?
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {GOAL_TYPES.map((g) => {
          const sel = g.id === selected;
          return (
            <div
              key={g.id}
              onClick={() => onSelect(g.id)}
              role="button"
              style={{
                height: 104,
                borderRadius: 18,
                background: sel ? 'var(--blue-tint)' : 'var(--card)',
                border: `1px solid ${sel ? 'var(--blue)' : 'var(--card-border)'}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                cursor: 'pointer',
              }}
            >
              <GoalIcon type={g.id} size={26} color={sel ? 'var(--blue)' : 'var(--text-secondary)'} />
              <span style={{ fontSize: 14, fontWeight: 600, color: sel ? 'var(--text)' : 'var(--text-secondary)' }}>
                {g.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </Shell>
);
