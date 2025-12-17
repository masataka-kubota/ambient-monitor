import { useTranslation } from "react-i18next";

import { BleWifiForm, BleWifiStatus } from "@/components/ble";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HeaderNavigation } from "@/components/navigation";

const BleWifiSettings = () => {
  const { t } = useTranslation();

  return (
    <>
      <HeaderNavigation title={t("wifi.title")} />
      <KeyboardAvoidingScrollableView hasHeader={true}>
        {/* Status */}
        <BleWifiStatus />

        {/* Form */}
        <BleWifiForm />
      </KeyboardAvoidingScrollableView>
    </>
  );
};

export default BleWifiSettings;
