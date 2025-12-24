import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

import {
  connectedDeviceAtom,
  connectedDeviceIdAtom,
  scannedDevicesAtom,
} from "@/atoms";
import {
  BleConnectedUI,
  BleNotConnectedUI,
  BleReconnectUI,
} from "@/components/ble";
import { KeyboardAvoidingScrollableView } from "@/components/layouts";
import { HeaderNavigation } from "@/components/navigation";
import { useBleConnect, useBlePermissions, useBleScan } from "@/hooks/ble";

const BleSettings = () => {
  const { requestBlePermissions } = useBlePermissions();
  const { scanForPeripherals } = useBleScan();
  const { connectToDevice, disconnectDevice, forgetDevice, isConnecting } =
    useBleConnect();
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const connectedDeviceId = useAtomValue(connectedDeviceIdAtom);
  const scannedDevices = useAtomValue(scannedDevicesAtom);
  const { t } = useTranslation();

  const handleScan = async () => {
    const isPermissionsGranted = await requestBlePermissions();
    if (isPermissionsGranted) scanForPeripherals();
  };

  return (
    <>
      <HeaderNavigation title={t("ble.title")} />
      <KeyboardAvoidingScrollableView hasHeader={true}>
        {connectedDevice ? (
          <BleConnectedUI
            connectedDevice={connectedDevice}
            onDisconnect={disconnectDevice}
          />
        ) : connectedDeviceId ? (
          <BleReconnectUI forgetDevice={forgetDevice} />
        ) : (
          <BleNotConnectedUI
            scannedDevices={scannedDevices}
            onScan={handleScan}
            onConnect={connectToDevice}
            isConnecting={isConnecting}
          />
        )}
      </KeyboardAvoidingScrollableView>
    </>
  );
};

export default BleSettings;
