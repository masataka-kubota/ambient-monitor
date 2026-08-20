import { renderHook } from '@testing-library/react-native';
import { useTranslation } from 'react-i18next';

import useThemeOptions from './useThemeOptions';

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

const mockT = jest.fn((key: string) => {
  const labels: Record<string, string> = {
    'settings.theme.system': 'System',
    'settings.theme.light': 'Light',
    'settings.theme.dark': 'Dark',
  };

  return labels[key] ?? key;
});

describe('useThemeOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useTranslation).mockReturnValue({
      t: mockT,
    } as unknown as ReturnType<typeof useTranslation>);
  });

  it('returns the theme options in the expected order with localized labels', async () => {
    const { result } = await renderHook(() => useThemeOptions());

    expect(result.current).toEqual([
      { id: 0, name: 'System', value: 'system' },
      { id: 1, name: 'Light', value: 'light' },
      { id: 2, name: 'Dark', value: 'dark' },
    ]);

    expect(mockT).toHaveBeenCalledWith('settings.theme.system');
    expect(mockT).toHaveBeenCalledWith('settings.theme.light');
    expect(mockT).toHaveBeenCalledWith('settings.theme.dark');
  });

  it('memoizes the option list while the translation function remains stable', async () => {
    const { result, rerender } = await renderHook(() => useThemeOptions());
    const firstResult = result.current;

    rerender({});

    expect(result.current).toBe(firstResult);
    expect(mockT).toHaveBeenCalledTimes(3);
  });
});
