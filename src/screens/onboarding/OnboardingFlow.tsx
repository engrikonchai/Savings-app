import React, { useState } from 'react';
import { Welcome } from './Welcome';
import { ChooseGoalType } from './ChooseGoalType';
import { Step1, Step2, Step3, CreateSuccess, monthOptionDate } from './CreateGoalSteps';
import { useApp } from '../../context/AppContext';
import { goalTypeDef } from '../../lib/goalTypes';
import type { GoalTypeId } from '../../lib/types';
import { formatMonthYear, weeksBetween } from '../../lib/calc';
import { currencySymbol } from '../../lib/currency';

type Step = 'welcome' | 'choose' | 'step1' | 'step2' | 'step3' | 'done';

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { createGoal, today, state } = useApp();
  const [step, setStep] = useState<Step>('welcome');
  const [typeId, setTypeId] = useState<GoalTypeId>('car');
  const [name, setName] = useState(goalTypeDef('car').defaultName);
  const [amount, setAmount] = useState(3000);
  const [current, setCurrent] = useState(0);
  const [monthIndex, setMonthIndex] = useState(2);

  const symbol = currencySymbol(state.currency);
  const targetDate = monthOptionDate(today, monthIndex + 1);
  const weeks = weeksBetween(today, targetDate);
  const remaining = Math.max(0, amount - current);
  const weekly = Math.ceil(remaining / weeks);
  const weeklyLabel = `${symbol}${weekly.toLocaleString('en-US')}`;
  const targetLabel = formatMonthYear(targetDate);

  const back: Record<Exclude<Step, 'welcome' | 'done'>, Step> = {
    choose: 'welcome',
    step1: 'choose',
    step2: 'step1',
    step3: 'step2',
  };

  const handleSelectType = (id: GoalTypeId) => {
    setTypeId(id);
  };

  const goChoose = () => setStep('choose');
  const goStep1 = () => {
    setName(goalTypeDef(typeId).defaultName);
    setStep('step1');
  };

  const finish = () => {
    createGoal({
      typeId,
      name: name.trim() || goalTypeDef(typeId).defaultName,
      targetAmount: amount,
      currentSaved: current,
      predictedDate: targetDate.toISOString(),
    });
    setStep('done');
  };

  if (step === 'welcome') return <Welcome onStart={goChoose} />;
  if (step === 'choose') {
    return <ChooseGoalType selected={typeId} onSelect={handleSelectType} onBack={() => setStep('welcome')} onContinue={goStep1} />;
  }
  if (step === 'step1') {
    return (
      <Step1
        typeId={typeId}
        typeLabel={goalTypeDef(typeId).label}
        photoPrompt={goalTypeDef(typeId).photoPrompt}
        name={name}
        onChangeName={setName}
        onBack={() => setStep(back.step1)}
        onContinue={() => setStep('step2')}
      />
    );
  }
  if (step === 'step2') {
    return (
      <Step2
        amount={amount}
        current={current}
        onChangeAmount={setAmount}
        onChangeCurrent={setCurrent}
        currencySymbol={symbol}
        onBack={() => setStep(back.step2)}
        onContinue={() => setStep('step3')}
      />
    );
  }
  if (step === 'step3') {
    return (
      <Step3
        today={today}
        monthIndex={monthIndex}
        onChangeMonthIndex={setMonthIndex}
        weeklyLabel={weeklyLabel}
        targetLabel={targetLabel}
        onBack={() => setStep(back.step3)}
        onFinish={finish}
      />
    );
  }
  // done
  return <CreateSuccess goalName={name} weeklyLabel={weeklyLabel} targetLabel={targetLabel} onDone={onComplete} />;
};
