import React, { useState } from 'react';
import { Shell } from '../../components/Shell';
import { PrimaryCTA } from '../../components/PrimaryCTA';
import { BrandMark, CheckIcon } from '../../components/Icon';
import { useAuth } from '../../context/AuthContext';

/** Shown whenever AuthContext.passwordRecovery is true — i.e. the user just followed a
 * password-reset email link — regardless of what else is going on in the app. Takes over the
 * whole screen until they've set a new password or backed out. */
export const ResetPassword: React.FC = () => {
  const { updatePassword, signOut, clearPasswordRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const valid = password.length >= 6 && password === confirm;

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await updatePassword(password);
    setSubmitting(false);
    if (err) setError(err);
    else setDone(true);
  };

  if (done) {
    return (
      <Shell bottomSlot={<PrimaryCTA label="Continue" onClick={clearPasswordRecovery} />}>
        <div
          className="fade-in"
          style={{ minHeight: '100%', boxSizing: 'border-box', padding: '0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}
        >
          <div style={{ width: 60, height: 60, borderRadius: 9999, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: '0 10px 26px var(--blue-shadow)' }}>
            <CheckIcon color="var(--on-blue)" size={22} />
          </div>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: 10 }}>Password updated.</div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5 }}>You're all set — continue into your account.</div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell bottomSlot={<PrimaryCTA label={submitting ? 'Saving…' : 'Set new password'} onClick={submit} disabled={!valid || submitting} />}>
      <div className="fade-in" style={{ minHeight: '100%', boxSizing: 'border-box', padding: '90px 28px 140px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36 }}>
          <BrandMark bg="var(--blue)" bar="var(--on-blue)" size={64} />
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)', marginTop: 18, marginBottom: 6, textAlign: 'center' }}>
            Choose a new password
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>You'll stay signed in with the new one.</div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,59,48,0.12)', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 18 }}>
            <span style={{ fontSize: 13, color: 'var(--negative)', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            New password
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            type="password"
            autoComplete="new-password"
            style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--chip-border)', paddingBottom: 10, fontSize: 17, fontWeight: 500, color: 'var(--text)', outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.08em', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
            Confirm password
          </div>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Type it again"
            type="password"
            autoComplete="new-password"
            style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', borderBottom: '1.5px solid var(--chip-border)', paddingBottom: 10, fontSize: 17, fontWeight: 500, color: 'var(--text)', outline: 'none' }}
          />
        </div>
        {confirm.length > 0 && password !== confirm && (
          <div style={{ fontSize: 12, color: 'var(--negative)', marginTop: 6 }}>Passwords don't match.</div>
        )}

        <div style={{ flex: 1 }} />

        <div
          onClick={() => {
            clearPasswordRecovery();
            signOut();
          }}
          role="button"
          style={{ textAlign: 'center', cursor: 'pointer', paddingTop: 20 }}
        >
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Cancel and sign out</span>
        </div>
      </div>
    </Shell>
  );
};
