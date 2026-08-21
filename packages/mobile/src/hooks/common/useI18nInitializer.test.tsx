import { act, renderHook, waitFor } from '@testing-library/react-native';
import { getLocales } from 'expo-localization';
import { useAtomValue } from 'jotai';

import { languageAtom } from '@/atoms';
import { INITIAL_LANGUAGE_CODE } from '@/constants';
import { initI18n } from '@/i18n';
import { createTestWrapper } from '@/test/helpers';
import type { LanguageCode } from '@/types';

import useI18nInitializer from './useI18nInitializer';

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(),
}));

jest.mock('@/i18n', () => ({
  initI18n: jest.fn(),
}));

const mockGetLocales = jest.mocked(getLocales);
const mockInitI18n = jest.mocked(initI18n);

const mockLocales = (languageCode: string | null) => {
  mockGetLocales.mockReturnValue([{ languageCode }] as unknown as ReturnType<typeof getLocales>);
};

const renderUseI18nInitializer = async (storedLanguage: LanguageCode | null) =>
  renderHook(
    () => {
      const hook = useI18nInitializer();
      const language = useAtomValue(languageAtom);

      return { ...hook, language };
    },
    {
      wrapper: createTestWrapper({ atoms: [[languageAtom, storedLanguage]] }),
    },
  );

describe('useI18nInitializer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocales('en');
    mockInitI18n.mockResolvedValue(undefined);
  });

  it('starts with i18n not ready', async () => {
    mockInitI18n.mockImplementation(() => new Promise(() => {}));

    const { result } = await renderUseI18nInitializer(null);

    expect(result.current.isI18nReady).toBe(false);
  });

  it('initializes with the stored language when one is already persisted', async () => {
    mockLocales('en');

    const { result } = await renderUseI18nInitializer('ja');

    await waitFor(() => {
      expect(result.current.isI18nReady).toBe(true);
    });

    expect(mockInitI18n).toHaveBeenCalledWith('ja');
    expect(result.current.language).toBe('ja');
  });

  it('falls back to a supported device language when nothing is stored', async () => {
    mockLocales('ja');

    const { result } = await renderUseI18nInitializer(null);

    await waitFor(() => {
      expect(result.current.isI18nReady).toBe(true);
    });

    expect(mockInitI18n).toHaveBeenCalledWith('ja');
    expect(result.current.language).toBe('ja');
  });

  it('falls back to the initial language when the device language is unsupported', async () => {
    mockLocales('fr');

    const { result } = await renderUseI18nInitializer(null);

    await waitFor(() => {
      expect(result.current.isI18nReady).toBe(true);
    });

    expect(mockInitI18n).toHaveBeenCalledWith(INITIAL_LANGUAGE_CODE);
    expect(result.current.language).toBe(INITIAL_LANGUAGE_CODE);
  });

  it('falls back to the initial language when the device locale is missing', async () => {
    mockGetLocales.mockReturnValue([] as unknown as ReturnType<typeof getLocales>);

    const { result } = await renderUseI18nInitializer(null);

    await waitFor(() => {
      expect(result.current.isI18nReady).toBe(true);
    });

    expect(mockInitI18n).toHaveBeenCalledWith(INITIAL_LANGUAGE_CODE);
    expect(result.current.language).toBe(INITIAL_LANGUAGE_CODE);
  });

  it('keeps i18n not ready when initialization fails', async () => {
    mockInitI18n.mockRejectedValue(new Error('init failed'));

    const { result } = await renderUseI18nInitializer('en');

    await act(async () => {
      await Promise.resolve();
    });

    expect(mockInitI18n).toHaveBeenCalledWith('en');
    expect(result.current.isI18nReady).toBe(false);
  });
});
