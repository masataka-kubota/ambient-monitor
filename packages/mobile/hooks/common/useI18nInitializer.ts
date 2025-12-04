import { getLocales } from "expo-localization";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

import { languageAtom } from "@/atoms";
import { INITIAL_LANGUAGE_CODE } from "@/constants";
import { initI18n } from "@/i18n";
import { isSupportedLanguageCode } from "@/utils";

const useI18nInitializer = () => {
  const storedLanguage = useAtomValue(languageAtom);
  const [isI18nReady, setIsI18nReady] = useState(false);

  useEffect(() => {
    const run = async () => {
      // 1. Get device language
      const deviceLang = getLocales()[0]?.languageCode;
      const supportedDeviceLang = isSupportedLanguageCode(deviceLang)
        ? deviceLang
        : INITIAL_LANGUAGE_CODE;

      // 2. Check stored language
      const lng = storedLanguage ?? supportedDeviceLang;

      // 3. Initialize
      await initI18n(lng);
      setIsI18nReady(true);
    };

    run();
  }, [storedLanguage]);

  return { isI18nReady };
};

export default useI18nInitializer;
