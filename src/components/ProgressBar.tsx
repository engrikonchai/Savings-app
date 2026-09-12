import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme';

interface ProgressBarProps {
  progress: number; // 0..1
  height?: number;
  trackColor?: string;
  fillColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 10,
  trackColor = 'rgba(28,30,27,0.08)',
  fillColor = colors.accent,
  style,
}: ProgressBarProps) {
  const animated = useSharedValue(0);

  useEffect(() => {
    animated.value = withTiming(Math.min(1, Math.max(0, progress)), {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animated]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${animated.value * 100}%`,
  }));

  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: trackColor, borderRadius: height / 2 },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.fill,
          fillStyle,
          { backgroundColor: fillColor, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
