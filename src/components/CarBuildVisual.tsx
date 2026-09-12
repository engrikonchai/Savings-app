import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// A simple stylised hatchback silhouette, side profile, drawn in a 240x140 box —
// long flat trunk/hood decks with a short, sharply-stepped cabin roof, so it
// reads unmistakably as a car even before any detail is unlocked.
const BODY_PATH =
  'M20,100 L20,84 Q20,80 26,80 L76,80 L92,52 L148,52 L172,80 L214,80 Q220,80 220,84 L220,100 Z';
const WINDOW_PATH = 'M84,76 L96,58 L144,58 L164,76 Z';

interface CarBuildVisualProps {
  /** 0-100 goal progress driving how much of the car is "unlocked". */
  percent: number;
}

/**
 * "Build Your Car" reward visual: a dark silhouette at 0% that progressively
 * gains wheels (25%), body colour (50%), headlights + glow (75%), and a
 * small celebration flourish at 100%.
 */
export function CarBuildVisual({ percent }: CarBuildVisualProps) {
  const wheels = useSharedValue(0);
  const colorFill = useSharedValue(0);
  const lights = useSharedValue(0);
  const celebrate = useSharedValue(0);

  useEffect(() => {
    wheels.value = withSpring(percent >= 25 ? 1 : 0, { damping: 11, stiffness: 120 });
    colorFill.value = withTiming(percent >= 50 ? 1 : 0, { duration: 650, easing: Easing.out(Easing.cubic) });
    lights.value = withTiming(percent >= 75 ? 1 : 0, { duration: 550, easing: Easing.out(Easing.cubic) });
    celebrate.value =
      percent >= 100
        ? withDelay(150, withSequence(withTiming(1, { duration: 400 }), withTiming(0.82, { duration: 500 })))
        : withTiming(0, { duration: 250 });
  }, [percent, wheels, colorFill, lights, celebrate]);

  const bodyColorProps = useAnimatedProps(() => ({ opacity: colorFill.value }));
  const detailProps = useAnimatedProps(() => ({ opacity: wheels.value }));
  const wheelProps = useAnimatedProps(() => ({
    opacity: wheels.value,
    r: 11 + wheels.value * 4,
  }));
  const headlightProps = useAnimatedProps(() => ({ opacity: lights.value }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: lights.value * 0.7,
    transform: [{ scale: 0.8 + lights.value * 0.3 }],
  }));
  const celebrateStyle = useAnimatedStyle(() => ({
    opacity: celebrate.value,
    transform: [{ scale: 0.85 + celebrate.value * 0.25 }],
  }));

  return (
    <View style={styles.container}>
      {/* Headlight glow behind the artwork so it reads as ambient light */}
      <Animated.View pointerEvents="none" style={[styles.headlightGlow, glowStyle]} />

      <Svg width="100%" height="100%" viewBox="0 0 240 140" preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="carBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.accentLight} stopOpacity={1} />
            <Stop offset="100%" stopColor={colors.accentDark} stopOpacity={1} />
          </LinearGradient>
        </Defs>

        {/* Base silhouette — always visible from 0%. */}
        <Path d={BODY_PATH} fill={colors.backgroundElevated} stroke={colors.textTertiary} strokeWidth={2} />

        {/* Body colour, unlocked at 50%. */}
        <AnimatedPath d={BODY_PATH} fill="url(#carBodyGradient)" animatedProps={bodyColorProps} />

        {/* Window detail, unlocked at 25% alongside the wheels. */}
        <AnimatedPath d={WINDOW_PATH} fill={colors.background} animatedProps={detailProps} />

        {/* Wheels, unlocked at 25%. */}
        <AnimatedCircle cx={56} cy={100} fill={colors.background} stroke={colors.textPrimary} strokeWidth={3} animatedProps={wheelProps} />
        <AnimatedCircle cx={188} cy={100} fill={colors.background} stroke={colors.textPrimary} strokeWidth={3} animatedProps={wheelProps} />

        {/* Headlight, unlocked at 75%. */}
        <AnimatedCircle cx={216} cy={86} r={5} fill={colors.accentLight} animatedProps={headlightProps} />
      </Svg>

      <Animated.View pointerEvents="none" style={[styles.celebrate, celebrateStyle]}>
        <Ionicons name="sparkles" size={22} color={colors.accentLight} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlightGlow: {
    position: 'absolute',
    top: '46%',
    right: '8%',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accentGlow,
  },
  celebrate: {
    position: 'absolute',
    top: '18%',
    right: '14%',
  },
});
