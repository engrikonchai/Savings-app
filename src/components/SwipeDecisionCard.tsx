import React, { useCallback } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme';

const PUCK_SIZE = 56;
const EDGE_INSET = 6;

interface SwipeDecisionCardProps {
  leftLabel: string;
  leftIcon: keyof typeof Ionicons.glyphMap;
  rightLabel: string;
  rightIcon: keyof typeof Ionicons.glyphMap;
  onLeft: () => void;
  onRight: () => void;
}

/**
 * A single decision track with a draggable puck in the middle and two large
 * labeled zones either side — drag the puck to a side, or just tap it,
 * to commit. Doubles as a fast, reliable tap target and a satisfying swipe.
 */
export function SwipeDecisionCard({
  leftLabel,
  leftIcon,
  rightLabel,
  rightIcon,
  onLeft,
  onRight,
}: SwipeDecisionCardProps) {
  const trackWidth = useSharedValue(0);
  const translateX = useSharedValue(0);

  const onLayout = (e: LayoutChangeEvent) => {
    trackWidth.value = e.nativeEvent.layout.width;
  };

  const triggerLeft = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onLeft();
  }, [onLeft]);

  const triggerRight = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onRight();
  }, [onRight]);

  const pan = Gesture.Pan()
    .onChange((e) => {
      'worklet';
      const limit = Math.max(0, trackWidth.value / 2 - PUCK_SIZE / 2 - EDGE_INSET);
      translateX.value = Math.min(limit, Math.max(-limit, translateX.value + e.changeX));
    })
    .onEnd(() => {
      'worklet';
      const limit = Math.max(0, trackWidth.value / 2 - PUCK_SIZE / 2 - EDGE_INSET);
      const threshold = limit * 0.7;
      if (limit > 0 && translateX.value <= -threshold) {
        translateX.value = withSpring(-limit, { damping: 16 });
        runOnJS(triggerLeft)();
      } else if (limit > 0 && translateX.value >= threshold) {
        translateX.value = withSpring(limit, { damping: 16 });
        runOnJS(triggerRight)();
      } else {
        translateX.value = withSpring(0, { damping: 16 });
      }
    });

  const puckStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftZoneStyle = useAnimatedStyle(() => {
    const limit = Math.max(1, trackWidth.value / 2 - PUCK_SIZE / 2 - EDGE_INSET);
    return { opacity: interpolate(translateX.value, [-limit, 0], [1, 0.5], Extrapolation.CLAMP) };
  });
  const rightZoneStyle = useAnimatedStyle(() => {
    const limit = Math.max(1, trackWidth.value / 2 - PUCK_SIZE / 2 - EDGE_INSET);
    return { opacity: interpolate(translateX.value, [0, limit], [0.5, 1], Extrapolation.CLAMP) };
  });

  return (
    <View>
      <View style={styles.track} onLayout={onLayout}>
        <Pressable style={[styles.zone, styles.zoneLeft]} onPress={triggerLeft} hitSlop={8}>
          <Animated.View style={[styles.zoneContent, leftZoneStyle]}>
            <Ionicons name={leftIcon} size={18} color={colors.accentLight} />
            <Text style={styles.zoneLabel}>{leftLabel}</Text>
          </Animated.View>
        </Pressable>

        <Pressable style={[styles.zone, styles.zoneRight]} onPress={triggerRight} hitSlop={8}>
          <Animated.View style={[styles.zoneContent, rightZoneStyle]}>
            <Text style={[styles.zoneLabel, styles.zoneLabelRight]}>{rightLabel}</Text>
            <Ionicons name={rightIcon} size={18} color={colors.textPrimary} />
          </Animated.View>
        </Pressable>

        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.puck, puckStyle]}>
            <Ionicons name="swap-horizontal" size={22} color={colors.inkPrimary} />
          </Animated.View>
        </GestureDetector>
      </View>
      <Text style={styles.hint}>Drag the puck, or tap a side</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  zone: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  zoneLeft: {
    alignItems: 'flex-start',
  },
  zoneRight: {
    alignItems: 'flex-end',
  },
  zoneContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  zoneLabel: {
    ...typography.caption,
    color: colors.accentLight,
  },
  zoneLabelRight: {
    color: colors.textPrimary,
  },
  puck: {
    position: 'absolute',
    left: '50%',
    marginLeft: -PUCK_SIZE / 2,
    width: PUCK_SIZE,
    height: PUCK_SIZE,
    borderRadius: PUCK_SIZE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  hint: {
    ...typography.micro,
    color: colors.textTertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
});
