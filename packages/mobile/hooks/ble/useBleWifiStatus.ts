import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { connectedDeviceAtom, wifiStatusAtom } from "@/atoms";
import {
  BLE_SERVICE_UUID,
  STATUS_MAP,
  WIFI_STATUS_CHAR_UUID,
} from "@/constants/ble";
import { bleManager } from "@/lib";
import { WifiStatus } from "@/types";

const parse = (data: number[]): WifiStatus => {
  const buf = Buffer.from(data);
  const status = STATUS_MAP[buf.readUInt8(0)] ?? "not_configured";
  const ssid = buf.toString("utf8", 1);
  return { status, ssid };
};

const useBleWifiStatus = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const setWifiStatus = useSetAtom(wifiStatusAtom);

  const fetchWifiStatus = useCallback(async () => {
    if (!connectedDevice) return null;

    try {
      const data = await bleManager.read(
        connectedDevice.id,
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      const status = parse(data);
      setWifiStatus(status);
      return status;
    } catch (e) {
      console.error("Failed to read WiFi status", e);
      setWifiStatus(null);
      return null;
    }
  }, [connectedDevice, setWifiStatus]);

  return { fetchWifiStatus };
};

export default useBleWifiStatus;
