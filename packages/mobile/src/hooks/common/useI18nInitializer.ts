import { getLocales } from 'expo-localization';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import { languageAtom } from '@/atoms';
import { INITIAL_LANGUAGE_CODE } from '@/constants';
import { initI18n } from '@/i18n';
import { isSupportedLanguageCode } from '@/utils';

interface UseI18nInitializerResult {
  /**
   * `true` after i18n has been initialized and the resolved language persisted.
   * Remains `false` while initialization is in progress or if it fails.
   */
  isI18nReady: boolean;
}

/**
 * Boots i18n once on mount using the stored language, or the device language as a fallback.
 *
 * Resolution order:
 * 1. Persisted `languageAtom` value, when present
 * 2. Device locale language code, when it is a supported `LanguageCode`
 * 3. `INITIAL_LANGUAGE_CODE` otherwise
 *
 * On success the resolved code is written back to storage and `isI18nReady` becomes `true`.
 * If initialization throws, `isI18nReady` stays `false` because readiness is only set after success.
 *
 * @returns Readiness flag for gating UI that depends on translations.
 */
const useI18nInitializer = (): UseI18nInitializerResult => {
  const [storedLanguage, setStoredLanguage] = useAtom(languageAtom);
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      // 1. Get device language
      const deviceLang = getLocales()[0]?.languageCode ?? null;
      const supportedDeviceLang = isSupportedLanguageCode(deviceLang)
        ? deviceLang
        : INITIAL_LANGUAGE_CODE;

      // 2. Check stored language
      const lng = storedLanguage ?? supportedDeviceLang;

      // 3. Initialize
      await initI18n(lng);
      await setStoredLanguage(lng);
      setIsI18nReady(true);
    };

    run();
  }, [setStoredLanguage, storedLanguage]);

  return { isI18nReady };
};

export default useI18nInitializer;
