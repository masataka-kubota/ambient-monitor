import { useAtomValue } from 'jotai';
import { useColorScheme } from 'react-native';

import { themeModeAtom } from '@/atoms';
import { APP_THEME_COLORS } from '@/constants';
import type { ThemeColors } from '@/types';

interface UseAppThemeResult {
  /**
   * `true` when the resolved scheme is dark.
   * Driven by an explicit `dark` preference, or by the system scheme when mode is `system`.
   */
  isDarkMode: boolean;
  /**
   * Color tokens for the resolved scheme (`light` or `dark`).
   * Suitable for component styling; not the full light/dark theme map.
   */
  activeThemeColors: ThemeColors;
}

/**
 * Resolves the active app theme from the user's preference and the system scheme.
 *
 * When the stored mode is `system`, any color scheme other than `dark`
 * (including `light` and `unspecified`) is treated as light.
 * Explicit `light` or `dark` preferences ignore the system scheme.
 *
 * @returns Whether dark mode is active and the matching theme color tokens.
 */
const useAppTheme = (): UseAppThemeResult => {
  const systemScheme = useColorScheme();
  const userMode = useAtomValue(themeModeAtom);

  // `useColorScheme` returns 'light' | 'dark' | 'unspecified'.
  // Only treat an explicit 'dark' scheme as dark.
  const resolvedSystemScheme = systemScheme === 'dark' ? 'dark' : 'light';

  const activeScheme = userMode === 'system' ? resolvedSystemScheme : userMode;
  const activeThemeColors = APP_THEME_COLORS[activeScheme];

  const isDarkMode = activeScheme === 'dark';

  return { isDarkMode, activeThemeColors };
};

export default useAppTheme;
