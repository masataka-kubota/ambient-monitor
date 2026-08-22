/**
 * Resolved color scheme used for UI tokens (`light` | `dark`).
 */
export type ThemeSchemeName = 'light' | 'dark';

/**
 * User theme preference, including follow-system (`system`).
 */
export type ThemeMode = 'system' | 'light' | 'dark';

/**
 * Semantic color tokens for app chrome and content (text, surfaces, tint, error).
 */
export interface ThemeColors {
  mainColor: string;
  mediumColor: string;
  lightColor: string;
  mainBackground: string;
  secondaryBackground: string;
  navBackground: string;
  shadow: string;
  tint: string;
  onTint: string;
  link: string;
  error: string;
}

/**
 * Light and dark palettes keyed by scheme; source for `APP_THEME_COLORS`.
 */
export interface AppThemeColors {
  light: ThemeColors;
  dark: ThemeColors;
}
