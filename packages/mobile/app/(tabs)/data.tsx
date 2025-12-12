import { useTranslation } from "react-i18next";

import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { DataMeasurementsView } from "@/components/measurements";
import { Heading } from "@/components/ui";

const Data = () => {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingScrollableView>
      <Heading iconLib="Entypo" iconName="line-graph" align="center">
        {t("data.title")}
      </Heading>
      <DataMeasurementsView />
    </KeyboardAvoidingScrollableView>
  );
};

export default Data;
