import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme, YStack } from 'tamagui';

import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import { queryClient } from '@/services/api/queryClient';
import { AppSplashScreen } from '@/shared/components/AppSplashScreen';
import { useThemeStore } from '@/store/theme.store';
import { config } from '@/theme';

const MIN_SPLASH_MS = 2000;

/**
 * Restores the session before the router tree renders, showing the splash while
 * it resolves. This guarantees route guards run against a definitive auth state.
 */
function SessionGate({ children }: { children: ReactNode }) {
  const { ready } = useSessionBootstrap();
  const [minimumElapsed, setMinimumElapsed] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMinimumElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(timeout);
  }, []);

  if (!ready) return <AppSplashScreen />;

  return (
    <YStack flex={1}>
      {children}
      {!minimumElapsed ? (
        <YStack position="absolute" top={0} right={0} bottom={0} left={0}>
          <AppSplashScreen />
        </YStack>
      ) : null}
    </YStack>
  );
}

/**
 * App-wide providers: gesture root → safe area → Tamagui (themed by the Zustand
 * theme store) → React Query → session gate. Keeps `app/_layout.tsx` thin.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={mode}>
          <Theme name={mode}>
            <QueryClientProvider client={queryClient}>
              <SessionGate>{children}</SessionGate>
            </QueryClientProvider>
          </Theme>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
