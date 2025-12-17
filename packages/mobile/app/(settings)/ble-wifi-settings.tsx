import { useTranslation } from "react-i18next";

import { BleWifiForm, BleWifiStatus } from "@/components/ble";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HeaderNavigation } from "@/components/navigation";
import { useBleWifiStatus } from "@/hooks/ble";

const BleWifiSettings = () => {
  const { loading } = useBleWifiStatus();
  const { t } = useTranslation();

  return (
    <>
      <HeaderNavigation title={t("wifi.title")} />
      <KeyboardAvoidingScrollableView hasHeader={true}>
        {/* Status */}
        <BleWifiStatus loading={loading} />

        {/* Form */}
        <BleWifiForm loading={loading} />
      </KeyboardAvoidingScrollableView>
    </>
  );
};

export default BleWifiSettings;
