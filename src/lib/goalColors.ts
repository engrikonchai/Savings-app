/** Per-goal accent colors — purely cosmetic (a dot/bar in the goals list so goals are easy to
 * tell apart at a glance). The app's own chrome always stays iOS blue regardless of which of
 * these a goal uses; this never re-themes the app. */
export const GOAL_COLORS: string[] = [
  '#0A84FF', // iOS blue (default — matches the app's own accent)
  '#34C759', // green
  '#FF9F0A', // orange
  '#FF375F', // pink
  '#AF52DE', // purple
  '#5AC8FA', // teal
];

export const DEFAULT_GOAL_COLOR = GOAL_COLORS[0];

export function isKnownGoalColor(color: string | null | undefined): color is string {
  return !!color && GOAL_COLORS.includes(color);
}
