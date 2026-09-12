import React, { useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, radius, spacing, typography } from '../theme';
import { formatDateLong } from '../utils/date';
import { PressableScale } from './PressableScale';

interface GoalDateFieldProps {
  value: Date;
  minimumDate: Date;
  onChange: (date: Date) => void;
}

/**
 * Native (iOS/Android) target-date picker. Web has its own implementation
 * (see GoalDateField.web.tsx) since @react-native-community/datetimepicker
 * has no web support and renders nothing there.
 */
export function GoalDateField({ value, minimumDate, onChange }: GoalDateFieldProps) {
  const [showPicker, setShowPicker] = useState(Platform.OS === 'ios');

  return (
    <>
      {Platform.OS === 'android' && (
        <PressableScale style={styles.dateButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.dateButtonText}>{formatDateLong(value.toISOString())}</Text>
        </PressableScale>
      )}
      {showPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          minimumDate={minimumDate}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, selectedDate) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (selectedDate) onChange(selectedDate);
          }}
          themeVariant="light"
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    backgroundColor: colors.creamMuted,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  dateButtonText: {
    ...typography.h3,
    color: colors.inkPrimary,
  },
});
