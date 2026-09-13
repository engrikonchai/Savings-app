import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp, useIsDark } from './context/AppContext';
import { AuthScreen } from './screens/auth/AuthScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { OnboardingFlow } from './screens/onboarding/OnboardingFlow';
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

type Screen = TabName | 'addMoney' | 'dreamDays' | 'manageGoals' | 'editGoal' | 'celebration';

/**
 * Gates on auth/loading only — no onboarding logic here. This keeps "is there a goal yet"
 * out of this component's own state, so it never has to reconcile a stale snapshot against
 * a `state.goal` that can change mid-flow (e.g. the instant a new goal is created).
 */
const Root: React.FC = () => {
  const { authLoading, session, configured } = useAuth();
  const { initialLoading } = useApp();
  const [guestPreview, setGuestPreview] = useState(false);

  if (authLoading) return <LoadingScreen label="Checking your session…" />;

  // Not signed in: gate behind the auth screen, unless the user asked to preview the demo,
  // or Supabase isn't configured at all (in which case guest/demo is the only mode available).
  if (!session && !guestPreview && configured) {
    return <AuthScreen onContinueAsGuest={() => setGuestPreview(true)} />;
  }

  // For a signed-in user, wait out the one-time fetch of their existing goal (if any) before
  // mounting AppShell below — that's what lets AppShell's own "do we need onboarding" snapshot
  // be taken safely exactly once, with state.goal already reflecting the real answer.
  if (session && initialLoading) return <LoadingScreen label="Loading your goal…" />;

  return <AppShell key={session?.user.id ?? 'guest'} onSignInFromGuest={() => setGuestPreview(false)} />;
};

/**
 * Owns all post-auth navigation state. Remounted (fresh `key`) whenever the signed-in
 * identity changes, and only ever mounted once the initial data fetch for that identity has
 * settled — so `showOnboarding`'s lazy initializer reads a trustworthy state.goal exactly
 * once. After that, it changes only in response to the user explicitly finishing onboarding
 * (OnboardingFlow's onComplete) — never by reacting to state.goal again — so a goal that
 * gets created *during* the flow can't unmount the flow out from under its own success screen.
 */
const AppShell: React.FC<{ onSignInFromGuest: () => void }> = ({ onSignInFromGuest }) => {
  const { state } = useApp();
  const isDark = useIsDark();
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(() => !state.goal);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  // Defensive only: showOnboarding's snapshot should guarantee this. Not expected to trigger.
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
        <Profile onNavigate={goTab} onManageGoals={() => setScreen('manageGoals')} onEditGoal={() => setScreen('editGoal')} onSignIn={onSignInFromGuest} />
      );
    case 'manageGoals':
      return <ManageGoals onBack={() => setScreen('profile')} />;
    case 'editGoal':
      return <EditGoal onBack={() => setScreen('profile')} onSaved={() => setScreen('profile')} />;
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
