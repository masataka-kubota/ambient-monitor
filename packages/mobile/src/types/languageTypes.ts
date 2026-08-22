import type { SUPPORTED_LANGUAGES } from '@/constants';

/**
 * App locale code drawn from `SUPPORTED_LANGUAGES` (`en` | `ja`).
 */
export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number];
