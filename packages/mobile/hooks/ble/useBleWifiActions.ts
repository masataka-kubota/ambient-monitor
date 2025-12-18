import { useAtomValue } from "jotai";
import { useCallback } from "react";

import { connectedDeviceAtom } from "@/atoms";
import { BLE_SERVICE_UUID, WIFI_CONFIG_CHAR_UUID } from "@/constants/ble";
import useBleWifiStatus from "@/hooks/ble/useBleWifiStatus";
import { WifiFormValues } from "@/types";
import { base64 } from "@/utils";

const useBleWifiActions = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const { updateWifiStatus } = useBleWifiStatus();

  const initializeWifiConfig = useCallback(async () => {
    if (!connectedDevice) return null;

    try {
      const json = JSON.stringify({ ssid: "", password: "" });
      const base64Payload = base64.encode(json);

      await connectedDevice.writeCharacteristicWithResponseForService(
        BLE_SERVICE_UUID,
        WIFI_CONFIG_CHAR_UUID,
        base64Payload,
      );

      const status = await updateWifiStatus();
      return status;
    } catch (e) {
      console.error("Failed to initialize Wi-Fi", e);
      return null;
    }
  }, [connectedDevice, updateWifiStatus]);

  const updateWifiConfig = useCallback(
    async (values: WifiFormValues) => {
      if (!connectedDevice) return null;

      const json = JSON.stringify(values);
      const base64Payload = base64.encode(json);

      try {
        await connectedDevice.writeCharacteristicWithResponseForService(
          BLE_SERVICE_UUID,
          WIFI_CONFIG_CHAR_UUID,
          base64Payload,
        );

        const status = await updateWifiStatus();
        return status;
      } catch (e) {
        console.error("Failed to write WiFi config", e);
        return null;
      }
    },
    [connectedDevice, updateWifiStatus],
  );

  return { initializeWifiConfig, updateWifiConfig };
};

export default useBleWifiActions;
