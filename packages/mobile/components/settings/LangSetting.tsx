import { useAtom } from "jotai";
import { memo, useCallback } from "react";
import { useTranslation } from "react-i18next";

import { languageAtom } from "@/atoms";
import { RadioGroup } from "@/components/ui";
import { LANGUAGE_CODE_OPTIONS } from "@/constants";

const LangSetting = () => {
  const { i18n } = useTranslation();
  const [themeMode, setThemeMode] = useAtom(languageAtom);

  const selectedId =
    LANGUAGE_CODE_OPTIONS.find((opt) => opt.value === themeMode)?.id ?? 1;

  const handlePress = useCallback(
    async (id: number) => {
      const selected = LANGUAGE_CODE_OPTIONS.find((opt) => opt.id === id);
      if (selected) {
        await i18n.changeLanguage(selected.value);
        setThemeMode(selected.value);
      }
    },
    [i18n, setThemeMode],
  );

  return (
    <RadioGroup
      data={LANGUAGE_CODE_OPTIONS}
      selectedId={selectedId}
      onPress={handlePress}
    />
  );
};

export default memo(LangSetting);
