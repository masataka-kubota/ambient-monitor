import type { LanguageCode } from '@/types/languageTypes';
import type { ThemeMode } from '@/types/themeTypes';

/**
 * Base option shape for radio-group style settings lists.
 */
export interface RadioGroupOptions {
  id: number;
  name: string;
}

/**
 * Theme preference option shown in settings (`value` is a `ThemeMode`).
 */
export interface ThemeOption extends RadioGroupOptions {
  value: ThemeMode;
}

/**
 * Language preference option shown in settings (`value` is a `LanguageCode`).
 */
export interface LanguageCodeOption extends RadioGroupOptions {
  value: LanguageCode;
}
