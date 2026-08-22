import type { LanguageCode, LanguageCodeOption } from '@/types';

/**
 * Locale codes supported by the app i18n resources (`en`, `ja`).
 */
export const SUPPORTED_LANGUAGES = ['en', 'ja'] as const;

/**
 * Fallback language when no stored preference and device locale are unsupported.
 */
export const INITIAL_LANGUAGE_CODE: LanguageCode = 'en';

/**
 * Radio / settings UI options for choosing the app language.
 */
export const LANGUAGE_CODE_OPTIONS: LanguageCodeOption[] = [
  { id: 1, name: 'English', value: 'en' },
  { id: 2, name: '日本語', value: 'ja' },
];
