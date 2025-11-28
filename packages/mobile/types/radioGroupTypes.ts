import { ThemeMode } from "@/types/themeTypes";

export interface RadioGroupOptions {
  id: number;
  name: string;
}

export interface ThemeOption extends RadioGroupOptions {
  value: ThemeMode;
}
