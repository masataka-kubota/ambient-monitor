import { useTranslation } from "react-i18next";

import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { LangSetting, ThemeSetting } from "@/components/settings";
import { Heading } from "@/components/ui";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingScrollableView>
      {/* Theme */}
      <Heading mt={20}>{t("settings.title.theme")}</Heading>
      <ThemeSetting />

      {/* Language */}
      <Heading mt={50}>{t("settings.title.lang")}</Heading>
      <LangSetting />
    </KeyboardAvoidingScrollableView>
  );
};

export default Settings;
