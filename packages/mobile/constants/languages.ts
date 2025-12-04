import { LanguageCode, LanguageCodeOption } from "@/types";

export const SUPPORTED_LANGUAGES = ["en", "ja"] as const;
export const INITIAL_LANGUAGE_CODE: LanguageCode = "en";

export const LANGUAGE_CODE_OPTIONS: LanguageCodeOption[] = [
  { id: 1, name: "English", value: "en" },
  { id: 2, name: "日本語", value: "ja" },
];
