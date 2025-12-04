import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import { dateFormatter } from "@/i18n/dateFormatter";
import en from "@/i18n/locales/en";
import ja from "@/i18n/locales/ja";
import { LanguageCode } from "@/types";

export const initI18n = async (languageCode: LanguageCode) => {
  if (i18next.isInitialized) return;

  // eslint-disable-next-line import/no-named-as-default-member
  await i18next.use(initReactI18next).init({
    lng: languageCode,
    fallbackLng: "en",
    // debug: true,
    resources: {
      ja,
      en,
    },
    interpolation: {
      escapeValue: false,
      format: dateFormatter,
    },
  });
};
