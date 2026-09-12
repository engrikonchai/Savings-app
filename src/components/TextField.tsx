import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface TextFieldProps extends TextInputProps {
  label: string;
  prefix?: string;
  error?: string;
}

export function TextField({ label, prefix, error, style, ...rest }: TextFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          placeholderTextColor={colors.inkTertiary}
          style={[styles.input, style]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputRowError: {
    borderColor: colors.spend,
  },
  prefix: {
    ...typography.h3,
    color: colors.inkSecondary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.h3,
    color: colors.inkPrimary,
    paddingVertical: spacing.sm,
  },
  error: {
    ...typography.caption,
    color: colors.spend,
    marginTop: spacing.xxs,
  },
});
