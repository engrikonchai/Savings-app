import React, { useState } from 'react';
import { ChooseGoalType } from './ChooseGoalType';
import { Step1, Step2, Step3, CreateSuccess, monthOptionDate } from './CreateGoalSteps';
import { useApp } from '../../context/AppContext';
import { goalTypeDef } from '../../lib/goalTypes';
import { DEFAULT_GOAL_COLOR } from '../../lib/goalColors';
import type { GoalTypeId } from '../../lib/types';
import { formatMonthYear, weeksBetween } from '../../lib/calc';
import { currencySymbol } from '../../lib/currency';

type Step = 'choose' | 'step1' | 'step2' | 'step3' | 'done';

interface Props {
  onComplete: () => void;
  /** Called if the user backs out of the very first step. Omit to make the flow
   * non-cancellable (used when it's the only thing standing between the user and having zero
   * goals — first-run onboarding, or right after deleting their last goal). */
  onCancel?: () => void;
}

/** The goal-creation wizard (type → name → cost → target date), shared by first-run
 * onboarding (after Welcome) and "add another goal" from the goals list. */
export const CreateGoalFlow: React.FC<Props> = ({ onComplete, onCancel }) => {
  const { createGoal, today, state, dataLoading, dataError, clearDataError } = useApp();
  const [step, setStep] = useState<Step>('choose');
  const [typeId, setTypeId] = useState<GoalTypeId>('car');
  const [name, setName] = useState(goalTypeDef('car').defaultName);
  const [amount, setAmount] = useState(3000);
  const [current, setCurrent] = useState(0);
  const [monthIndex, setMonthIndex] = useState(2);
  const [color, setColor] = useState(DEFAULT_GOAL_COLOR);

  const symbol = currencySymbol(state.currency);
  const targetDate = monthOptionDate(today, monthIndex + 1);
  const weeks = weeksBetween(today, targetDate);
  const remaining = Math.max(0, amount - current);
  const weekly = Math.ceil(remaining / weeks);
  const weeklyLabel = `${symbol}${weekly.toLocaleString('en-US')}`;
  const targetLabel = formatMonthYear(targetDate);

  const back: Record<Exclude<Step, 'choose' | 'done'>, Step> = {
    step1: 'choose',
    step2: 'step1',
    step3: 'step2',
  };

  const handleSelectType = (id: GoalTypeId) => {
    // Set both together, from the id argument rather than the `typeId` state — setting name
    // in a later handler that reads `typeId` via closure risks a stale value if this handler
    // and the next one both fire before React re-renders in between (e.g. two rapid clicks).
    setTypeId(id);
    setName(goalTypeDef(id).defaultName);
  };

  const finish = async () => {
    clearDataError();
    const ok = await createGoal({
      typeId,
      name: name.trim() || goalTypeDef(typeId).defaultName,
      targetAmount: amount,
      currentSaved: current,
      predictedDate: targetDate.toISOString(),
      color,
    });
    if (ok) setStep('done');
  };

  if (step === 'choose') {
    return <ChooseGoalType selected={typeId} onSelect={handleSelectType} onBack={() => onCancel?.()} onContinue={() => setStep('step1')} />;
  }
  if (step === 'step1') {
    return (
      <Step1
        typeId={typeId}
        typeLabel={goalTypeDef(typeId).label}
        photoPrompt={goalTypeDef(typeId).photoPrompt}
        name={name}
        color={color}
        onChangeName={setName}
        onChangeColor={setColor}
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
        submitting={dataLoading}
        error={dataError}
      />
    );
  }
  // done
  return <CreateSuccess goalName={name} weeklyLabel={weeklyLabel} targetLabel={targetLabel} onDone={onComplete} />;
};
