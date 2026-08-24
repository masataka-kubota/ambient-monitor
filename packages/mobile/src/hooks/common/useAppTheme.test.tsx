import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { themeModeAtom } from '@/atoms';
import { APP_THEME_COLORS } from '@/constants';
import { createTestWrapper } from '@/test/helpers';
import type { ThemeMode } from '@/types';

import useAppTheme from './useAppTheme';

const mockUseColorScheme = jest.spyOn(ReactNative, 'useColorScheme');

const renderUseAppTheme = async (
  themeMode: ThemeMode,
  systemScheme: ReturnType<typeof ReactNative.useColorScheme>,
) => {
  mockUseColorScheme.mockReturnValue(systemScheme);

  return renderHook(() => useAppTheme(), {
    wrapper: createTestWrapper({ atoms: [[themeModeAtom, themeMode]] }),
  });
};

describe('useAppTheme', () => {
  afterEach(() => {
    mockUseColorScheme.mockReset();
  });

  afterAll(() => {
    mockUseColorScheme.mockRestore();
  });

  it('uses light theme colors when the user selects light mode', async () => {
    const { result } = await renderUseAppTheme('light', 'dark');

    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.activeThemeColors).toBe(APP_THEME_COLORS.light);
  });

  it('uses dark theme colors when the user selects dark mode', async () => {
    const { result } = await renderUseAppTheme('dark', 'light');

    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.activeThemeColors).toBe(APP_THEME_COLORS.dark);
  });

  it('follows the system dark scheme when the user selects system mode', async () => {
    const { result } = await renderUseAppTheme('system', 'dark');

    expect(result.current.isDarkMode).toBe(true);
    expect(result.current.activeThemeColors).toBe(APP_THEME_COLORS.dark);
  });

  it('follows the system light scheme when the user selects system mode', async () => {
    const { result } = await renderUseAppTheme('system', 'light');

    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.activeThemeColors).toBe(APP_THEME_COLORS.light);
  });

  it('treats an unspecified system scheme as light when the user selects system mode', async () => {
    const { result } = await renderUseAppTheme('system', 'unspecified');

    expect(result.current.isDarkMode).toBe(false);
    expect(result.current.activeThemeColors).toBe(APP_THEME_COLORS.light);
  });
});
