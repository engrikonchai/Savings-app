import { Ionicons } from '@expo/vector-icons';
import { GoalType } from '../types/models';

export interface GoalTypeMeta {
  type: GoalType;
  label: string;
  /** Outline icon used in UI chrome (onboarding cards, headers). */
  icon: keyof typeof Ionicons.glyphMap;
  /** Bold/filled icon used as the large silhouette behind the progress ring. */
  silhouetteIcon: keyof typeof Ionicons.glyphMap;
  namePlaceholder: string;
  defaultName: string;
}

export const GOAL_TYPES: GoalTypeMeta[] = [
  {
    type: 'car',
    label: 'First Car',
    icon: 'car-sport-outline',
    silhouetteIcon: 'car-sport',
    namePlaceholder: 'e.g. Golf 5',
    defaultName: 'My First Car',
  },
  {
    type: 'travel',
    label: 'Travel',
    icon: 'airplane-outline',
    silhouetteIcon: 'airplane',
    namePlaceholder: 'e.g. Summer in Greece',
    defaultName: 'Dream Trip',
  },
  {
    type: 'phone',
    label: 'New Phone',
    icon: 'phone-portrait-outline',
    silhouetteIcon: 'phone-portrait',
    namePlaceholder: 'e.g. iPhone 17 Pro',
    defaultName: 'New Phone',
  },
  {
    type: 'custom',
    label: 'Custom',
    icon: 'flag-outline',
    silhouetteIcon: 'flag',
    namePlaceholder: 'e.g. Emergency Fund',
    defaultName: 'My Goal',
  },
];

export const getGoalTypeMeta = (type: GoalType): GoalTypeMeta =>
  GOAL_TYPES.find((g) => g.type === type) ?? GOAL_TYPES[3];
