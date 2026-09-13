import React from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { colors } from '../theme';

const PHONE_WIDTH = 430;
const DESKTOP_BREAKPOINT = 560;

/**
 * Mobile-first: on a phone-sized viewport this renders full-bleed with no
 * overhead. On a wide (desktop) viewport it centers the app inside a
 * phone-shaped shell instead of letting it stretch edge to edge.
 */
export function PhoneShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  if (!isDesktop) {
    return <View style={styles.fill}>{children}</View>;
  }

  return (
    <View style={styles.desktopBackdrop}>
      <View style={styles.phone}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  desktopBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSunken,
  },
  phone: {
    width: PHONE_WIDTH,
    height: '92%',
    maxHeight: 932,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.5,
    shadowRadius: 48,
    elevation: 24,
  },
});
