import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp, useIsDark } from './context/AppContext';
import { AuthScreen } from './screens/auth/AuthScreen';
import { ResetPassword } from './screens/auth/ResetPassword';
import { LoadingScreen } from './screens/LoadingScreen';
import { OnboardingFlow } from './screens/onboarding/OnboardingFlow';
import { CreateGoalFlow } from './screens/onboarding/CreateGoalFlow';
import { Dashboard } from './screens/Dashboard';
import { AddMoney } from './screens/AddMoney';
import { DreamDays } from './screens/DreamDays';
import { History } from './screens/History';
import { Insights } from './screens/Insights';
import { Profile } from './screens/Profile';
import { ManageGoals } from './screens/ManageGoals';
import { EditGoal } from './screens/EditGoal';
import { Celebration } from './screens/Celebration';
import type { TabName } from './components/BottomNav';

type Screen = TabName | 'addMoney' | 'dreamDays' | 'manageGoals' | 'addGoal' | 'editGoal' | 'celebration';

/**
 * Gates on auth/loading/password-recovery only — no onboarding logic here. This keeps "is
 * there a goal yet" out of this component's own state, so it never has to reconcile a stale
 * snapshot against goals that can change mid-flow (e.g. the instant a new goal is created).
 */
const Root: React.FC = () => {
  const { authLoading, session, configured, passwordRecovery } = useAuth();
  const { initialLoading, loadFailed, retryLoad } = useApp();
  const [guestPreview, setGuestPreview] = useState(false);

  if (authLoading) return <LoadingScreen label="Checking your session…" />;

  // A password-reset email link takes over the whole app until it's resolved, regardless of
  // sign-in state — Supabase signs the user into a temporary recovery session to get here.
  if (passwordRecovery) return <ResetPassword />;

  // Not signed in: gate behind the auth screen, unless the user asked to preview the demo,
  // or Supabase isn't configured at all (in which case guest/demo is the only mode available).
  if (!session && !guestPreview && configured) {
    return <AuthScreen onContinueAsGuest={() => setGuestPreview(true)} />;
  }

  // For a signed-in user, wait out the one-time fetch of their existing goals (if any) before
  // mounting AppShell below — that's what lets AppShell's own "do we need goal creation" snapshot
  // be taken safely exactly once, with state.goals already reflecting the real answer.
  if (session && initialLoading) return <LoadingScreen label="Loading your goals…" />;

  if (session && loadFailed) {
    return (
      <LoadingScreenWithRetry onRetry={retryLoad} />
    );
  }

  return <AppShell key={session?.user.id ?? 'guest'} onSignInFromGuest={() => setGuestPreview(false)} />;
};

const LoadingScreenWithRetry: React.FC<{ onRetry: () => void }> = ({ onRetry }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center' }}>
    <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Couldn't load your data</div>
    <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: 280 }}>
      Check your connection and try again.
    </div>
    <div
      onClick={onRetry}
      role="button"
      style={{ marginTop: 8, padding: '12px 24px', borderRadius: 16, background: 'var(--blue)', boxShadow: '0 8px 22px var(--blue-shadow)', cursor: 'pointer' }}
    >
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-blue)' }}>Try again</span>
    </div>
  </div>
);

/**
 * Owns all post-auth navigation state. Remounted (fresh `key`) whenever the signed-in
 * identity changes, and only ever mounted once the initial data fetch for that identity has
 * settled — so `showCreateFlow`'s lazy initializer reads a trustworthy state.goals exactly
 * once. After that it only flips true again if the user's goal count drops to zero while the
 * shell is already mounted (they deleted their last goal) — never by reacting to state.goals
 * going non-empty, so a goal created *during* the flow can't unmount the flow's own success
 * screen out from under it.
 */
const AppShell: React.FC<{ onSignInFromGuest: () => void }> = ({ onSignInFromGuest }) => {
  const { state } = useApp();
  const isDark = useIsDark();
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [showCreateFlow, setShowCreateFlow] = useState(() => state.goals.length === 0);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const prevGoalCount = useRef(state.goals.length);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    if (prevGoalCount.current > 0 && state.goals.length === 0) setShowCreateFlow(true);
    prevGoalCount.current = state.goals.length;
  }, [state.goals.length]);

  if (showCreateFlow) {
    // A brand-new account (never created a goal on this device before) gets the full
    // Welcome intro; someone who just deleted their last goal goes straight back to creating
    // one, with no cancel — there's nothing else to show them.
    return state.hasCreatedGoalBefore ? (
      <CreateGoalFlow onComplete={() => setShowCreateFlow(false)} />
    ) : (
      <OnboardingFlow onComplete={() => setShowCreateFlow(false)} />
    );
  }

  // Defensive only: showCreateFlow's snapshot should guarantee this. Not expected to trigger.
  if (!state.goal) return <LoadingScreen label="Loading your goal…" />;

  const goTab = (tab: TabName) => setScreen(tab);

  switch (screen) {
    case 'dashboard':
      return (
        <Dashboard
          onNavigate={goTab}
          onAddMoney={() => setScreen('addMoney')}
          onDreamDays={() => setScreen('dreamDays')}
          onPreviewCelebration={() => setScreen('celebration')}
          onCelebrate={() => setScreen('celebration')}
        />
      );
    case 'addMoney':
      return <AddMoney onDone={() => setScreen('dashboard')} onGoalCompleted={() => setScreen('celebration')} />;
    case 'dreamDays':
      return <DreamDays onDone={() => setScreen('dashboard')} onGoalCompleted={() => setScreen('celebration')} />;
    case 'history':
      return <History onNavigate={goTab} />;
    case 'insights':
      return <Insights onNavigate={goTab} />;
    case 'profile':
      return (
        <Profile
          onNavigate={goTab}
          onManageGoals={() => setScreen('manageGoals')}
          onEditGoal={() => {
            setEditingGoalId(state.goal!.id);
            setScreen('editGoal');
          }}
          onSignIn={onSignInFromGuest}
        />
      );
    case 'manageGoals':
      return (
        <ManageGoals
          onBack={() => setScreen('profile')}
          onAddGoal={() => setScreen('addGoal')}
          onViewGoal={() => setScreen('dashboard')}
          onEditGoal={(goalId) => {
            setEditingGoalId(goalId);
            setScreen('editGoal');
          }}
        />
      );
    case 'addGoal':
      return <CreateGoalFlow onComplete={() => setScreen('manageGoals')} onCancel={() => setScreen('manageGoals')} />;
    case 'editGoal':
      return (
        <EditGoal
          goalId={editingGoalId ?? state.goal.id}
          onBack={() => setScreen('manageGoals')}
          onSaved={() => setScreen('manageGoals')}
          onDeleted={() => setScreen('dashboard')}
        />
      );
    case 'celebration':
      return <Celebration onBack={() => setScreen('dashboard')} />;
    default:
      return null;
  }
};

const App: React.FC = () => (
  <AuthProvider>
    <AppProvider>
      <Root />
    </AppProvider>
  </AuthProvider>
);

export default App;
