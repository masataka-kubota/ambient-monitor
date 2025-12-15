import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import {
  connectedDeviceAtom,
  isBleConnectedAtom,
  scannedDevicesAtom,
} from "@/atoms";
import {
  BleConnectedUI,
  BleNotConnectedUI,
  BleReconnectUI,
} from "@/components/ble";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HeaderNavigation } from "@/components/navigation";
import { ThemeText } from "@/components/ui";
import { useBleConnect, useBlePermissions, useBleScan } from "@/hooks/ble";

const BleSettings = () => {
  const { requestBlePermissions } = useBlePermissions();
  const { scanForPeripherals } = useBleScan();
  const { connectToDevice, disconnectDevice } = useBleConnect();
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const scannedDevices = useAtomValue(scannedDevicesAtom);
  const isBleConnected = useAtomValue(isBleConnectedAtom);
  const { t } = useTranslation();

  const handleScan = async () => {
    const isPermissionsGranted = await requestBlePermissions();
    if (isPermissionsGranted) scanForPeripherals();
  };

  if (isBleConnected === null) return <ThemeText>Loading...</ThemeText>;

  return (
    <>
      <HeaderNavigation title={t("ble.title")} />
      <KeyboardAvoidingScrollableView hasHeader={true}>
        {!connectedDevice ? (
          <BleNotConnectedUI
            scannedDevices={scannedDevices}
            onScan={handleScan}
            onConnect={connectToDevice}
          />
        ) : isBleConnected ? (
          <BleConnectedUI
            connectedDevice={connectedDevice}
            onDisconnect={disconnectDevice}
          />
        ) : (
          <BleReconnectUI
            connectedDevice={connectedDevice}
            onReconnect={connectToDevice}
            onDisconnect={disconnectDevice}
          />
        )}
      </KeyboardAvoidingScrollableView>
    </>
  );
};

export default BleSettings;
