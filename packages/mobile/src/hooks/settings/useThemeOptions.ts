import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ThemeOption } from '@/types';

/**
 * Builds the selectable theme options shown in settings.
 *
 * The labels are localized through i18n so the menu reflects the current
 * language while keeping a stable option order of system, light, and dark.
 *
 * @returns Ordered theme choices for the app's theme selector.
 */
const useThemeOptions = (): ThemeOption[] => {
  const { t } = useTranslation();

  const themeOptions: ThemeOption[] = useMemo(
    () => [
      { id: 0, name: t('settings.theme.system'), value: 'system' },
      { id: 1, name: t('settings.theme.light'), value: 'light' },
      { id: 2, name: t('settings.theme.dark'), value: 'dark' },
    ],
    [t],
  );

  return themeOptions;
};

export default useThemeOptions;
