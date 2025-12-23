import { useAtomValue } from "jotai";
import { useCallback } from "react";

import { connectedDeviceAtom } from "@/atoms";
import { BLE_SERVICE_UUID, WIFI_CONFIG_CHAR_UUID } from "@/constants/ble";
import useBleWifiStatus from "@/hooks/ble/useBleWifiStatus";
import { bleManager } from "@/lib";
import { WifiFormValues } from "@/types";

const WIFI_SSID_MAX_LEN = 32;
const WIFI_PASSWORD_MAX_LEN = 64;
const MAX_BYTE_SIZE = WIFI_SSID_MAX_LEN + WIFI_PASSWORD_MAX_LEN;

const buildWifiConfigPayload = (values: WifiFormValues): Uint8Array => {
  const buffer = Buffer.alloc(WIFI_SSID_MAX_LEN + WIFI_PASSWORD_MAX_LEN);

  buffer.write(values.ssid ?? "", 0, WIFI_SSID_MAX_LEN, "utf8");
  buffer.write(
    values.password ?? "",
    WIFI_SSID_MAX_LEN,
    WIFI_PASSWORD_MAX_LEN,
    "utf8",
  );

  return buffer;
};

const useBleWifiActions = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const { fetchWifiStatus } = useBleWifiStatus();

  const initializeWifiConfig = useCallback(async () => {
    if (!connectedDevice) return null;

    try {
      const payload = buildWifiConfigPayload({ ssid: "", password: "" });

      await bleManager.write(
        connectedDevice.id,
        BLE_SERVICE_UUID,
        WIFI_CONFIG_CHAR_UUID,
        Array.from(payload),
        MAX_BYTE_SIZE,
      );

      const status = await fetchWifiStatus();
      return status;
    } catch (e) {
      console.error("Failed to initialize Wi-Fi", e);
      return null;
    }
  }, [connectedDevice, fetchWifiStatus]);

  const updateWifiConfig = useCallback(
    async (values: WifiFormValues) => {
      if (!connectedDevice) return null;

      const payload = buildWifiConfigPayload(values);

      try {
        await bleManager.write(
          connectedDevice.id,
          BLE_SERVICE_UUID,
          WIFI_CONFIG_CHAR_UUID,
          Array.from(payload),
          MAX_BYTE_SIZE,
        );

        const status = await fetchWifiStatus();
        return status;
      } catch (e) {
        console.error("Failed to write WiFi config", e);
        return null;
      }
    },
    [connectedDevice, fetchWifiStatus],
  );

  return { initializeWifiConfig, updateWifiConfig };
};

export default useBleWifiActions;
