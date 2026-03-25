import { useAtomValue } from 'jotai';
import { useColorScheme } from 'react-native';

import { themeModeAtom } from '@/atoms';
import { APP_THEME_COLORS } from '@/constants';

const useResolvedTheme = () => {
  const system = useColorScheme() ?? 'light';
  const mode = useAtomValue(themeModeAtom);

  // If system color scheme is unavailable (e.g., on web), default to 'light'.
  const resolvedScheme = system === 'unspecified' ? 'light' : system;

  const finalScheme = mode === 'system' ? resolvedScheme : mode;
  const currentThemeColors = APP_THEME_COLORS[finalScheme];

  const isDarkMode = finalScheme === 'dark';

  return { finalScheme, isDarkMode, currentThemeColors };
};

export default useResolvedTheme;
