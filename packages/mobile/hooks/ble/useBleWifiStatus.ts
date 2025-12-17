import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { connectedDeviceAtom, wifiStatusAtom } from "@/atoms";
import { BLE_SERVICE_UUID, WIFI_STATUS_CHAR_UUID } from "@/constants/ble";
import { WifiStatus } from "@/types";
import { base64 } from "@/utils";

const useBleWifiStatus = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const setWifiStatus = useSetAtom(wifiStatusAtom);

  const [loading, setLoading] = useState(true);

  const fetchWifiStatus = useCallback(async () => {
    if (!connectedDevice) return;
    setLoading(true);
    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      if (!char.value) {
        setWifiStatus(null);
        return;
      }
      const decoded = base64.decode(char.value);
      const parsed: WifiStatus = JSON.parse(decoded);
      setWifiStatus(parsed);
    } catch (e) {
      console.error("Failed to read WiFi status", e);
      setWifiStatus(null);
    } finally {
      setLoading(false);
    }
  }, [connectedDevice, setWifiStatus]);

  const updateWifiStatus = useCallback(async () => {
    if (!connectedDevice) return null;

    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      const decoded = char.value ? base64.decode(char.value) : "{}";
      const status: WifiStatus = JSON.parse(decoded);

      setWifiStatus(status);

      return status;
    } catch (e) {
      console.error("Failed to fetch Wi-Fi status", e);
      return null;
    }
  }, [connectedDevice, setWifiStatus]);

  useEffect(() => {
    fetchWifiStatus();
  }, [fetchWifiStatus]);

  return {
    loading,
    updateWifiStatus,
  };
};

export default useBleWifiStatus;
