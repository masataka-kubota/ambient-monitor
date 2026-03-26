import { useAtomValue } from 'jotai';
import { useColorScheme } from 'react-native';

import { themeModeAtom } from '@/atoms';
import { APP_THEME_COLORS } from '@/constants';

const useAppTheme = () => {
  const systemScheme = useColorScheme();
  const userMode = useAtomValue(themeModeAtom);

  // `useColorScheme` can return 'light', 'dark', 'unspecified', or null/undefined.
  // Treat anything other than 'dark' as 'light' to be defensive.
  const resolvedSystemScheme = systemScheme === 'dark' ? 'dark' : 'light';

  const activeScheme = userMode === 'system' ? resolvedSystemScheme : userMode;
  const activeThemeColors = APP_THEME_COLORS[activeScheme];

  const isDarkMode = activeScheme === 'dark';

  return { isDarkMode, activeThemeColors };
};

export default useAppTheme;
