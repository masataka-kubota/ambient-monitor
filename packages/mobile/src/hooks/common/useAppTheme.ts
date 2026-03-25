import { useAtomValue } from 'jotai';
import { useColorScheme } from 'react-native';

import { themeModeAtom } from '@/atoms';
import { APP_THEME_COLORS } from '@/constants';

const useAppTheme = () => {
  const system = useColorScheme() ?? 'light';
  const mode = useAtomValue(themeModeAtom);

  // If system color scheme is unavailable (e.g., on web), default to 'light'.
  const resolvedScheme = system === 'unspecified' ? 'light' : system;

  const activeScheme = mode === 'system' ? resolvedScheme : mode;
  const activeThemeColors = APP_THEME_COLORS[activeScheme];

  const isDarkMode = activeScheme === 'dark';

  return { isDarkMode, activeThemeColors };
};

export default useAppTheme;
