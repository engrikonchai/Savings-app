import React, { useEffect } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme';
import { PressableScale } from './PressableScale';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  activeColor?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  activeColor = colors.accent,
}: SegmentedControlProps<T>) {
  const [containerWidth, setContainerWidth] = React.useState(0);
  const segmentWidth = containerWidth / options.length;
  const translateX = useSharedValue(0);
  const activeIndex = Math.max(0, options.findIndex((o) => o.value === value));

  useEffect(() => {
    translateX.value = withTiming(activeIndex * segmentWidth, { duration: 220 });
  }, [activeIndex, segmentWidth, translateX]);

  const knobStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    width: segmentWidth,
  }));

  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.track} onLayout={onLayout}>
      {containerWidth > 0 && (
        <Animated.View
          style={[styles.knob, knobStyle, { backgroundColor: activeColor }]}
        />
      )}
      {options.map((option) => (
        <PressableScale
          key={option.value}
          style={styles.segment}
          haptic="selection"
          onPress={() => onChange(option.value)}
        >
          <Text
            style={[
              styles.label,
              option.value === value && styles.labelActive,
            ]}
          >
            {option.label}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.pill,
    padding: 4,
    height: 52,
    position: 'relative',
  },
  knob: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    borderRadius: radius.pill,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 14,
  },
  labelActive: {
    color: colors.cream,
  },
});
