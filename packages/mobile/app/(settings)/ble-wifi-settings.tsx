import { BleWifiForm, BleWifiStatus } from "@/components/ble";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HeaderNavigation } from "@/components/navigation";
import { useBleWifiStatus } from "@/hooks/ble";

const BleWifiSettings = () => {
  const { loading } = useBleWifiStatus();

  return (
    <>
      <HeaderNavigation title="Wifi Settings" />
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
