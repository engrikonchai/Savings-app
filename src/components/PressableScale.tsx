import React from 'react';
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'selection' | 'none';
}

/**
 * A Pressable that gives a subtle satisfying scale-down on press plus a
 * matching haptic tick — used throughout the app for anything tappable.
 */
export function PressableScale({
  style,
  scaleTo = 0.96,
  haptic = 'light',
  onPressIn,
  onPressOut,
  onPress,
  children,
  ...rest
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withTiming(scaleTo, { duration: 90 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withTiming(1, { duration: 140 });
    onPressOut?.(e);
  };

  const handlePress = (e: GestureResponderEvent) => {
    if (haptic !== 'none') {
      const style =
        haptic === 'selection'
          ? undefined
          : {
              light: Haptics.ImpactFeedbackStyle.Light,
              medium: Haptics.ImpactFeedbackStyle.Medium,
              heavy: Haptics.ImpactFeedbackStyle.Heavy,
            }[haptic];
      if (haptic === 'selection') {
        Haptics.selectionAsync();
      } else if (style) {
        Haptics.impactAsync(style);
      }
    }
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
