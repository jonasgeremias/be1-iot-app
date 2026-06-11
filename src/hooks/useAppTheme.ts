import { useThemeStore } from '@/store/theme.store';

/** Convenience accessor for the current theme mode + togglers. */
export function useAppTheme() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const toggle = useThemeStore((s) => s.toggle);
  return { mode, isDark: mode === 'dark', setMode, toggle };
}
