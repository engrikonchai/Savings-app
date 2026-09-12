import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { ScreenContainer, Card, Button, TextField } from '../src/components';
import { PressableScale } from '../src/components/PressableScale';
import { GoalDateField } from '../src/components/GoalDateField';
import { getGoalTypeMeta } from '../src/constants/goalTypes';
import { GoalType } from '../src/types/models';
import { useGoalContext } from '../src/store/GoalContext';
import { colors, radius, spacing, typography } from '../src/theme';

function defaultTargetDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() + 6);
  return date;
}

export default function CreateGoalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  const { createGoal } = useGoalContext();

  const goalType = (params.type as GoalType) ?? 'custom';
  const meta = useMemo(() => getGoalTypeMeta(goalType), [goalType]);

  const [name, setName] = useState('');
  const [amountText, setAmountText] = useState('');
  const [targetDate, setTargetDate] = useState<Date>(defaultTargetDate());
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const amount = parseFloat(amountText.replace(',', '.'));
  const isValid = name.trim().length > 0 && !Number.isNaN(amount) && amount > 0 && targetDate > new Date();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo access to add a goal image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreate = async () => {
    if (!isValid) {
      setError('Please fill in a name, amount and a future date.');
      return;
    }
    setSubmitting(true);
    try {
      await createGoal({
        type: goalType,
        name: name.trim(),
        targetAmount: Math.round(amount),
        targetDate: targetDate.toISOString(),
        imageUri,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer scroll contentStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
        <Text style={styles.title}>Set up your goal</Text>
        <Text style={styles.subtitle}>Give it a name, a target, and a deadline.</Text>
      </View>

      <Card style={styles.card}>
        <TextField
          label="Goal name"
          placeholder={meta.namePlaceholder}
          value={name}
          onChangeText={(t) => {
            setName(t);
            setError(undefined);
          }}
          maxLength={40}
          returnKeyType="next"
        />
        <TextField
          label="Target amount"
          placeholder="3000"
          prefix="€"
          keyboardType="decimal-pad"
          value={amountText}
          onChangeText={(t) => {
            setAmountText(t);
            setError(undefined);
          }}
        />

        <Text style={styles.label}>Target date</Text>
        <GoalDateField
          value={targetDate}
          minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
          onChange={setTargetDate}
        />

        <Text style={[styles.label, { marginTop: spacing.md }]}>Goal photo (optional)</Text>
        <PressableScale style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>+ Add a photo</Text>
            </View>
          )}
        </PressableScale>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </Card>

      <View style={styles.footer}>
        <Button label="Create goal" onPress={handleCreate} loading={submitting} disabled={!isValid} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  card: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    color: colors.inkSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  imagePicker: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 120,
    borderRadius: radius.md,
    backgroundColor: colors.creamMuted,
    borderWidth: 1.5,
    borderColor: colors.creamBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    ...typography.body,
    color: colors.inkSecondary,
  },
  imagePreview: {
    height: 140,
    width: '100%',
    borderRadius: radius.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.spend,
    marginTop: spacing.sm,
  },
  footer: {
    marginTop: spacing.lg,
  },
});
