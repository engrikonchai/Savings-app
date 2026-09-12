import { GoalType } from '../types/models';

export interface GoalTypeMeta {
  type: GoalType;
  label: string;
  emoji: string;
  namePlaceholder: string;
  defaultName: string;
}

export const GOAL_TYPES: GoalTypeMeta[] = [
  {
    type: 'car',
    label: 'First Car',
    emoji: '🚗',
    namePlaceholder: 'e.g. Golf 5',
    defaultName: 'My First Car',
  },
  {
    type: 'travel',
    label: 'Travel',
    emoji: '✈️',
    namePlaceholder: 'e.g. Summer in Greece',
    defaultName: 'Dream Trip',
  },
  {
    type: 'phone',
    label: 'New Phone',
    emoji: '📱',
    namePlaceholder: 'e.g. iPhone 17 Pro',
    defaultName: 'New Phone',
  },
  {
    type: 'custom',
    label: 'Custom',
    emoji: '🎯',
    namePlaceholder: 'e.g. Emergency Fund',
    defaultName: 'My Goal',
  },
];

export const getGoalTypeMeta = (type: GoalType): GoalTypeMeta =>
  GOAL_TYPES.find((g) => g.type === type) ?? GOAL_TYPES[3];
