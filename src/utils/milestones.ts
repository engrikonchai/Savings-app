import { GoalProgress } from './goalMath';

interface Milestone {
  id: string;
  message: string;
  crossed: (before: GoalProgress, after: GoalProgress) => boolean;
}

/**
 * "Build Your Car" milestone call-outs — car-specific language ("wheels",
 * "build", "drive"), so these are only shown for `car`-type goals.
 */
const CAR_MILESTONES: Milestone[] = [
  {
    id: 'ready-to-drive',
    message: "You're ready to drive.",
    crossed: (before, after) => !before.isComplete && after.isComplete,
  },
  {
    id: 'halfway',
    message: 'Halfway there.',
    crossed: (before, after) => before.percent < 50 && after.percent >= 50,
  },
  {
    id: 'saved-500',
    message: '€500 saved — your build is taking shape.',
    crossed: (before, after) => before.savedAmount < 500 && after.savedAmount >= 500,
  },
  {
    id: 'first-100',
    message: 'First €100 saved — wheels unlocked.',
    crossed: (before, after) => before.savedAmount < 100 && after.savedAmount >= 100,
  },
];

/**
 * Returns the single most significant milestone crossed by moving from
 * `before` to `after` (checked highest-first so only one banner ever shows),
 * or null if none was crossed on this transaction.
 */
export function getCrossedCarMilestone(before: GoalProgress, after: GoalProgress): string | null {
  const hit = CAR_MILESTONES.find((m) => m.crossed(before, after));
  return hit?.message ?? null;
}
