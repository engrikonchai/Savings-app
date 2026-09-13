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
  /** Encouraging 0%-progress copy for the dashboard, given a formatted "first deposit" amount. */
  zeroStateCopy: (amountLabel: string) => string;
}

export const GOAL_TYPES: GoalTypeMeta[] = [
  {
    type: 'car',
    label: 'First Car',
    icon: 'car-sport-outline',
    silhouetteIcon: 'car-sport',
    namePlaceholder: 'e.g. Golf 5',
    defaultName: 'My First Car',
    zeroStateCopy: (amount) => `Your first ${amount} gets the wheels turning.`,
  },
  {
    type: 'travel',
    label: 'Travel',
    icon: 'airplane-outline',
    silhouetteIcon: 'airplane',
    namePlaceholder: 'e.g. Summer in Greece',
    defaultName: 'Dream Trip',
    zeroStateCopy: (amount) => `Your first ${amount} books the first mile.`,
  },
  {
    type: 'phone',
    label: 'New Phone',
    icon: 'phone-portrait-outline',
    silhouetteIcon: 'phone-portrait',
    namePlaceholder: 'e.g. iPhone 17 Pro',
    defaultName: 'New Phone',
    zeroStateCopy: (amount) => `Your first ${amount} powers things up.`,
  },
  {
    type: 'custom',
    label: 'Custom',
    icon: 'flag-outline',
    silhouetteIcon: 'flag',
    namePlaceholder: 'e.g. Emergency Fund',
    defaultName: 'My Goal',
    zeroStateCopy: (amount) => `Your first ${amount} gets the ball rolling.`,
  },
];

export const getGoalTypeMeta = (type: GoalType): GoalTypeMeta =>
  GOAL_TYPES.find((g) => g.type === type) ?? GOAL_TYPES[3];
