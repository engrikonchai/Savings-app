import type { GoalTypeId } from './types';

export interface GoalTypeDef {
  id: GoalTypeId;
  label: string;
  defaultName: string;
  photoPrompt: string;
}

export const GOAL_TYPES: GoalTypeDef[] = [
  { id: 'car', label: 'First car', defaultName: 'My First Car', photoPrompt: 'Add a photo of your dream car' },
  { id: 'travel', label: 'Travel', defaultName: 'My Trip', photoPrompt: 'Add a photo that captures your goal' },
  { id: 'phone', label: 'New phone', defaultName: 'New Phone', photoPrompt: 'Add a photo that captures your goal' },
  { id: 'gaming', label: 'Gaming setup', defaultName: 'Gaming Setup', photoPrompt: 'Add a photo that captures your goal' },
  { id: 'education', label: 'Education', defaultName: 'Education Fund', photoPrompt: 'Add a photo that captures your goal' },
  { id: 'custom', label: 'Custom goal', defaultName: 'My Goal', photoPrompt: 'Add a photo that captures your goal' },
];

export function goalTypeDef(id: GoalTypeId): GoalTypeDef {
  return GOAL_TYPES.find((g) => g.id === id) ?? GOAL_TYPES[GOAL_TYPES.length - 1];
}

/** Goal-generic copy everywhere; car-specific copy only when the First Car type is active. */
export function goalCopy(typeId: GoalTypeId, name: string) {
  const isCar = typeId === 'car';
  return {
    isCar,
    closerPrefix: isCar ? `Your ${name} is now` : 'Your goal is now',
    movesPrefix: isCar ? `Your ${name}` : 'Your goal',
    stayPrefix: isCar ? `Your ${name}` : 'Your goal',
    landsPrefix: isCar ? `Your ${name}` : 'Your goal',
    celebrationSubline: isCar ? `Your ${name} is yours.` : `${name}, fully funded.`,
    photoPrompt: goalTypeDef(typeId).photoPrompt,
  };
}
