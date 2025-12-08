import { useTranslation } from "react-i18next";

import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { Data24hGraph } from "@/components/measurements";
import { Heading } from "@/components/ui";

const Data = () => {
  const { t } = useTranslation();

  return (
    <KeyboardAvoidingScrollableView>
      <Heading iconName="line-graph" align="center">
        {t("data.title")}
      </Heading>
      <Data24hGraph />
    </KeyboardAvoidingScrollableView>
  );
};

export default Data;
