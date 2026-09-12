import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { GoalProvider, useGoalContext } from '../src/store/GoalContext';
import { PhoneShell } from '../src/components/PhoneShell';
import { colors } from '../src/theme';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { isReady } = useGoalContext();

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!isReady) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="create-goal" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="add-transaction"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="reality-check"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="result"
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GoalProvider>
          <PhoneShell>
            <RootNavigator />
          </PhoneShell>
          <StatusBar style="light" />
        </GoalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
