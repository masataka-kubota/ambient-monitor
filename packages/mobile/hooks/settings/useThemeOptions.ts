import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ThemeOption } from "@/types";

const useThemeOptions = () => {
  const { t } = useTranslation();

  const themeOptions: ThemeOption[] = useMemo(
    () => [
      { id: 0, name: t("settings.theme.system"), value: "system" },
      { id: 1, name: t("settings.theme.light"), value: "light" },
      { id: 2, name: t("settings.theme.dark"), value: "dark" },
    ],
    [t],
  );

  return themeOptions;
};

export default useThemeOptions;
