import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  /** Optional goal photo shown behind the ring as the hero visual. */
  imageUri?: string;
  /** Line-icon silhouette shown when no photo is set. */
  iconName?: keyof typeof Ionicons.glyphMap;
  /** Ratio the fill animation starts from (default 0) — used to animate an incremental change. */
  initialProgress?: number;
  /** Custom hero visual (e.g. the "Build Your Car" reward) shown instead of the icon silhouette when no photo is set. */
  heroContent?: React.ReactNode;
  children?: React.ReactNode;
}

export function ProgressRing({
  progress,
  size = 260,
  strokeWidth = 18,
  imageUri,
  iconName = 'sparkles',
  initialProgress = 0,
  heroContent,
  children,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(initialProgress);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, animatedProgress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  // The glow grows from nothing at 0% to a soft emerald aura at 100%.
  const outerGlowStyle = useAnimatedStyle(() => ({
    opacity: animatedProgress.value * 0.6,
    transform: [{ scale: 0.94 + animatedProgress.value * 0.12 }],
  }));
  const innerGlowStyle = useAnimatedStyle(() => ({
    opacity: animatedProgress.value * 0.45,
  }));

  const innerDiameter = size - strokeWidth * 2.6;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Ambient glow layers, grow with progress */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          outerGlowStyle,
          {
            width: size * 1.28,
            height: size * 1.28,
            borderRadius: (size * 1.28) / 2,
            backgroundColor: colors.accentGlow,
          },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          innerGlowStyle,
          {
            width: size * 1.08,
            height: size * 1.08,
            borderRadius: (size * 1.08) / 2,
            backgroundColor: colors.accent,
          },
        ]}
      />

      {/* Hero visual: goal photo or a line-icon silhouette */}
      <View
        style={[
          styles.heroClip,
          {
            width: innerDiameter,
            height: innerDiameter,
            borderRadius: innerDiameter / 2,
          },
        ]}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
            <View style={styles.heroScrim} />
          </>
        ) : (
          <LinearGradient
            colors={[colors.backgroundElevated, 'rgba(19,226,150,0.20)']}
            start={{ x: 0.15, y: 0.05 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.iconSilhouetteWrap}
          >
            {heroContent ?? (
              <Ionicons name={iconName} size={innerDiameter * 0.5} color="rgba(107,255,206,0.32)" />
            )}
          </LinearGradient>
        )}
      </View>

      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.glassBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accentLight}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  heroClip: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
  },
  iconSilhouetteWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10,11,13,0.28)',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
