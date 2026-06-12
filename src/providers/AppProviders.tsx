import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';

import { useSessionBootstrap } from '@/hooks/useSessionBootstrap';
import { queryClient } from '@/services/api/queryClient';
import { AppSplashScreen } from '@/shared/components/AppSplashScreen';
import { useThemeStore } from '@/store/theme.store';
import { config } from '@/theme';

/**
 * Restores the session before the router tree renders, showing the splash while
 * it resolves. This guarantees route guards run against a definitive auth state.
 */
function SessionGate({ children }: { children: ReactNode }) {
  const { ready } = useSessionBootstrap();
  if (!ready) return <AppSplashScreen />;
  return <>{children}</>;
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
