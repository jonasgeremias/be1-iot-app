import { QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';

import { queryClient } from '@/services/api/queryClient';
import { useThemeStore } from '@/store/theme.store';
import { config } from '@/theme';

/**
 * App-wide providers: gesture root → safe area → Tamagui (themed by the Zustand
 * theme store) → React Query. Keeps `app/_layout.tsx` thin.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  const mode = useThemeStore((s) => s.mode);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TamaguiProvider config={config} defaultTheme={mode}>
          <Theme name={mode}>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </Theme>
        </TamaguiProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
