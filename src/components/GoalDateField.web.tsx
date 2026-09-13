import React from 'react';
import { colors, radius, spacing } from '../theme';
import { fontFamily } from '../theme/typography';

interface GoalDateFieldProps {
  value: Date;
  minimumDate: Date;
  onChange: (date: Date) => void;
}

function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Web target-date picker. @react-native-community/datetimepicker has no
 * web implementation (it renders nothing), so on web we fall back to the
 * browser's native <input type="date">, styled to match the rest of the form.
 */
export function GoalDateField({ value, minimumDate, onChange }: GoalDateFieldProps) {
  return (
    // eslint-disable-next-line jsx-a11y/no-onchange -- plain DOM input, web-only file
    <input
      type="date"
      value={toInputValue(value)}
      min={toInputValue(minimumDate)}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        if (year && month && day) {
          onChange(new Date(year, month - 1, day));
        }
      }}
      style={{
        display: 'block',
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: colors.creamMuted,
        color: colors.inkPrimary,
        borderRadius: radius.md,
        border: 'none',
        outline: 'none',
        paddingLeft: spacing.md,
        paddingRight: spacing.md,
        minHeight: 56,
        marginBottom: spacing.sm,
        fontFamily: fontFamily.bold,
        fontSize: 19,
        colorScheme: 'light',
      }}
    />
  );
}
