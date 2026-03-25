import { useAtomValue } from 'jotai';
import { useColorScheme } from 'react-native';

import { themeModeAtom } from '@/atoms';
import { APP_THEME_COLORS } from '@/constants';

const useAppTheme = () => {
  const systemScheme = useColorScheme();
  const userMode = useAtomValue(themeModeAtom);

  // `useColorScheme` can return 'light', 'dark', or 'unspecified' (if the system color scheme is unavailable).
  // If system color scheme is unavailable (e.g., on web), default to 'light'.
  const resolvedSystemScheme =
    systemScheme === 'unspecified' ? 'light' : systemScheme;

  const activeScheme = userMode === 'system' ? resolvedSystemScheme : userMode;
  const activeThemeColors = APP_THEME_COLORS[activeScheme];

  const isDarkMode = activeScheme === 'dark';

  return { isDarkMode, activeThemeColors };
};

export default useAppTheme;
