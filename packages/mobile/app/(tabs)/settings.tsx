import { useTranslation } from "react-i18next";

import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { ThemeSetting } from "@/components/settings";
import { Heading } from "@/components/ui";

const Settings = () => {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingScrollableView>
      <Heading mt={20}>{t("settings.title.theme")}</Heading>
      <ThemeSetting />
    </KeyboardAvoidingScrollableView>
  );
};

export default Settings;
