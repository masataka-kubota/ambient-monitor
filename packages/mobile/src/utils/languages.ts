import { SUPPORTED_LANGUAGES } from '@/constants';
import type { LanguageCode } from '@/types';

/**
 * Checks whether a value is one of the app's supported language codes.
 *
 * @param value - The candidate language code, or null.
 * @returns True when the value is a valid `LanguageCode`; otherwise false.
 */
export const isSupportedLanguageCode = (value: string | null): value is LanguageCode => {
  if (value === null) {
    return false;
  }
  return SUPPORTED_LANGUAGES.some((lang) => lang === value);
};
