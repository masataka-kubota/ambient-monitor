import { LanguageCode } from "@/types/languageTypes";
import { ThemeMode } from "@/types/themeTypes";

export interface RadioGroupOptions {
  id: number;
  name: string;
}

export interface ThemeOption extends RadioGroupOptions {
  value: ThemeMode;
}

export interface LanguageCodeOption extends RadioGroupOptions {
  value: LanguageCode;
}
