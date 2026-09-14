import React, { useState } from 'react';
import { Welcome } from './Welcome';
import { CreateGoalFlow } from './CreateGoalFlow';

type Step = 'welcome' | 'create';

interface Props {
  onComplete: () => void;
}

/** First-run flow for a brand-new account: an intro screen, then the shared goal-creation
 * wizard (also used later for "add another goal" — see CreateGoalFlow). */
export const OnboardingFlow: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('welcome');

  if (step === 'welcome') return <Welcome onStart={() => setStep('create')} />;
  return <CreateGoalFlow onComplete={onComplete} onCancel={() => setStep('welcome')} />;
};
