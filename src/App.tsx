import React, { useEffect, useState } from 'react';
import { AppProvider, useApp, useIsDark } from './context/AppContext';
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

const Main: React.FC = () => {
  const { state } = useApp();
  const isDark = useIsDark();
  const [screen, setScreen] = useState<Screen>('dashboard');
  // Tracked separately from state.onboarded: the goal is created (and onboarded flips true)
  // a step before the user actually dismisses the "Your goal is live." success screen, so
  // gating on state.onboarded alone would unmount onboarding out from under that screen.
  const [onboardingActive, setOnboardingActive] = useState(() => !state.onboarded || !state.goal);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  if (onboardingActive) {
    return (
      <OnboardingFlow
        onComplete={() => {
          setOnboardingActive(false);
          setScreen('dashboard');
        }}
      />
    );
  }

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
      return <Profile onNavigate={goTab} onManageGoals={() => setScreen('manageGoals')} onEditGoal={() => setScreen('editGoal')} />;
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
  <AppProvider>
    <Main />
  </AppProvider>
);

export default App;
