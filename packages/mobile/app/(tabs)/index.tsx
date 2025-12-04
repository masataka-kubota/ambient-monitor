import { useTranslation } from "react-i18next";

import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { LiveMeasurementView } from "@/components/measurements";
import { Heading } from "@/components/ui";

const Index = () => {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingScrollableView>
      <Heading mt={20}>{t("live.title")}</Heading>
      <LiveMeasurementView />
    </KeyboardAvoidingScrollableView>
  );
};

export default Index;
