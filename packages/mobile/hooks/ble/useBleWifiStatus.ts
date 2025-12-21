import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { connectedDeviceAtom, wifiStatusAtom } from "@/atoms";
import { BLE_SERVICE_UUID, WIFI_STATUS_CHAR_UUID } from "@/constants/ble";
import { WifiStatus, WifiStatusCode } from "@/types";

const STATUS_MAP: Record<number, WifiStatusCode> = {
  0: "not_configured",
  1: "configured",
  2: "connecting",
  3: "connected",
  4: "failed",
};

export const parseWifiStatusPayloadFromBase64 = (b64: string): WifiStatus => {
  const binaryStr = atob(b64);
  const buffer = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    buffer[i] = binaryStr.charCodeAt(i);
  }

  const statusNum = buffer[0];
  const status: WifiStatusCode = STATUS_MAP[statusNum] ?? "not_configured";

  let ssid = "";
  for (let i = 1; i < buffer.length; i++) {
    if (buffer[i] === 0) break;
    ssid += String.fromCharCode(buffer[i]);
  }

  return { status, ssid };
};

const useBleWifiStatus = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const setWifiStatus = useSetAtom(wifiStatusAtom);

  const fetchWifiStatus = useCallback(async () => {
    if (!connectedDevice) return;

    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      if (!char.value) {
        setWifiStatus(null);
        return;
      }
      const parsed = parseWifiStatusPayloadFromBase64(char.value);
      setWifiStatus(parsed);
    } catch (e) {
      console.error("Failed to read WiFi status", e);
      setWifiStatus(null);
    }
  }, [connectedDevice, setWifiStatus]);

  const updateWifiStatus = useCallback(async () => {
    if (!connectedDevice) return null;

    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      if (!char.value) {
        setWifiStatus(null);
        return null;
      }
      const status = parseWifiStatusPayloadFromBase64(char.value);
      setWifiStatus(status);
      return status;
    } catch (e) {
      console.error("Failed to fetch Wi-Fi status", e);
      return null;
    }
  }, [connectedDevice, setWifiStatus]);

  return { fetchWifiStatus, updateWifiStatus };
};

export default useBleWifiStatus;
