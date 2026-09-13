import React, { useState } from 'react';
import { Shell } from '../../components/Shell';
import { PrimaryCTA } from '../../components/PrimaryCTA';
import { BrandMark } from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';

type Mode = 'signin' | 'signup';

interface Props {
  onContinueAsGuest: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onContinueAsGuest }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const valid = /\S+@\S+\.\S+/.test(email) && password.length >= 6;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      if (mode === 'signin') {
        const { error: err } = await signIn(email, password);
        if (err) setError(err);
      } else {
        const { error: err, needsEmailConfirmation } = await signUp(email, password);
        if (err) setError(err);
        else if (needsEmailConfirmation) setConfirmationSent(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <Shell>
        <div
          className="fade-in"
          style={{
            minHeight: '100%',
            boxSizing: 'border-box',
            padding: '0 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <BrandMark bg="var(--blue)" bar="var(--on-blue)" size={60} />
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', margin: '22px 0 10px' }}>
            Check your email
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>
            We sent a confirmation link to <span style={{ color: 'var(--text)', fontWeight: 600 }}>{email}</span>.
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Confirm it, then come back and sign in.</div>
          <div
            onClick={() => {
              setConfirmationSent(false);
              setMode('signin');
            }}
            role="button"
            style={{ marginTop: 28, padding: '10px 20px', borderRadius: 9999, border: '1px solid var(--chip-border)', cursor: 'pointer' }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Back to sign in</span>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell bottomSlot={<PrimaryCTA label={submitting ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'} onClick={submit} disabled={!valid || submitting} />}>
      <div className="fade-in" style={{ minHeight: '100%', boxSizing: 'border-box', padding: '90px 28px 140px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <BrandMark bg="var(--blue)" bar="var(--on-blue)" size={64} />
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginTop: 18, marginBottom: 6, textAlign: 'center' }}>
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
            {mode === 'signin' ? 'Sign in to pick up where you left off.' : 'Save your goal and every euro toward it, in the cloud.'}
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: 'var(--negative)', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Email
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            type="email"
            autoCapitalize="none"
            autoCorrect="off"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'transparent',
              border: 'none',
              borderBottom: '1.5px solid var(--chip-border)',
              paddingBottom: 10,
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Password
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            type="password"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'transparent',
              border: 'none',
              borderBottom: '1.5px solid var(--chip-border)',
              paddingBottom: 10,
              fontSize: 17,
              fontWeight: 500,
              color: 'var(--text)',
              outline: 'none',
            }}
          />
        </div>

        <div
          onClick={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
          }}
          role="button"
          style={{ marginTop: 18, textAlign: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          </span>
          <span style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 600 }}>{mode === 'signin' ? 'Sign up' : 'Sign in'}</span>
        </div>

        <div style={{ flex: 1 }} />

        <div onClick={onContinueAsGuest} role="button" style={{ textAlign: 'center', cursor: 'pointer', paddingTop: 20 }}>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>See a demo first, without an account →</span>
        </div>
      </div>
    </Shell>
  );
};
