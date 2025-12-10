import { SUPPORTED_LANGUAGES } from "@/constants";
import { LanguageCode } from "@/types";

export const isSupportedLanguageCode = (
  value: string | null,
): value is LanguageCode => {
  if (value === null) return false;
  return SUPPORTED_LANGUAGES.some((lang) => lang === value);
};
