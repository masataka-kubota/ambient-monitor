export type ThemeSchemeName = "light" | "dark";

export type ThemeMode = "system" | "light" | "dark";

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

export interface AppThemeColors {
  light: ThemeColors;
  dark: ThemeColors;
}
