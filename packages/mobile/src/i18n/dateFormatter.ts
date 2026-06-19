import type { Locale } from 'date-fns';
import { format as formatDate, parseISO } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import type { FormatFunction } from 'i18next';

import { INITIAL_LANGUAGE_CODE } from '@/constants';
import type { LanguageCode } from '@/types';
import { isSupportedLanguageCode } from '@/utils';

const localeMap: Record<LanguageCode, Locale> = {
  ja,
  en: enUS,
};

export const dateFormatter: FormatFunction = (
  value,
  format = 'PPP',
  lng = INITIAL_LANGUAGE_CODE,
): string => {
  if (value instanceof Date || typeof value === 'string') {
    const date = typeof value === 'string' ? parseISO(value) : value;
    const languageCode = isSupportedLanguageCode(lng) ? lng : INITIAL_LANGUAGE_CODE;
    const locale: Locale = localeMap[languageCode];

    return formatDate(date, format, { locale });
  }
  return String(value);
};
