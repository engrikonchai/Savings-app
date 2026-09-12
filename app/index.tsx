import { Redirect } from 'expo-router';
import { useGoalContext } from '../src/store/GoalContext';

export default function Index() {
  const { goal } = useGoalContext();
  return <Redirect href={goal ? '/(tabs)' : '/onboarding'} />;
}
