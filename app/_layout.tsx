import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, StyleSheet, useColorScheme, View } from 'react-native';

import { AppProviders } from '@/providers/AppProviders';
import { useThemeStore } from '@/store/theme.store';

const fallbackLogo = require('@/assets/images/be1-white.png');

export default function RootLayout() {
  const hydrate = useThemeStore((s) => s.hydrate);
  const hydrated = useThemeStore((s) => s.hydrated);
  const mode = useThemeStore((s) => s.mode);
  const setSystemMode = useThemeStore((s) => s.setSystemMode);
  const colorScheme = useColorScheme();
  const systemMode = colorScheme === 'dark' ? 'dark' : 'light';

  const [fontsLoaded, fontsError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  useEffect(() => {
    void hydrate(systemMode);
  }, [hydrate, systemMode]);

  useEffect(() => {
    setSystemMode(systemMode);
  }, [setSystemMode, systemMode]);

  const appReady = (fontsLoaded || fontsError) && hydrated;

  if (!appReady) {
    return (
      <View style={styles.bootFallback}>
        <Image source={fallbackLogo} style={styles.bootLogo} resizeMode="contain" />
      </View>
    );
  }

  return (
    <AppProviders>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  bootFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B3C84',
  },
  bootLogo: {
    width: 132,
    height: 132,
  },
});
