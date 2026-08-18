import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';

import { connectedDeviceAtom, wifiStatusAtom } from '@/atoms';
import { BLE_SERVICE_UUID, STATUS_MAP, WIFI_STATUS_CHAR_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';
import type { WifiStatus } from '@/types';

/**
 * Parses a BLE Wi‑Fi status payload into the app's normalized status model.
 *
 * The first byte is the Wi‑Fi status code and the remaining bytes represent the
 * SSID string. This keeps the BLE payload format consistent with the ESP32
 * firmware while exposing a simple object to the rest of the app.
 *
 * @param data - Raw BLE payload bytes returned from the Wi‑Fi status characteristic.
 * @returns A normalized Wi‑Fi status object containing the connection state and SSID.
 *
 * @example
 * // payload: [3, 0x48, 0x6f, 0x6d, 0x65, 0x2d, 0x57, 0x69, 0x46, 0x69]
 * // 3 => connected, followed by the UTF-8 SSID "Home-WiFi"
 * parseWifiStatusData([3, 0x48, 0x6f, 0x6d, 0x65, 0x2d, 0x57, 0x69, 0x46, 0x69]);
 * // => { status: 'connected', ssid: 'Home-WiFi' }
 */
export const parseWifiStatusData = (data: number[]): WifiStatus => {
  const buf = Buffer.from(data);
  const status = STATUS_MAP[buf.readUInt8(0)] ?? 'not_configured';
  const ssid = buf.toString('utf8', 1);
  return { status, ssid };
};

interface UseBleWifiStatusResult {
  /**
   * Reads the current Wi‑Fi status from the connected BLE device.
   * Updates the Wi‑Fi status atom and returns the parsed status, or `null`.
   */
  fetchWifiStatus: () => Promise<WifiStatus | null>;
}

/**
 * Reads the current Wi‑Fi status from the connected BLE device and stores the
 * result in the Jotai atom used by the app UI.
 *
 * @returns An object with a `fetchWifiStatus` function that reads the BLE
 * characteristic, updates the Wi‑Fi status atom, and returns the parsed status.
 */
const useBleWifiStatus = (): UseBleWifiStatusResult => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const setWifiStatus = useSetAtom(wifiStatusAtom);

  /** Reads Wi‑Fi status from the connected device and updates the Wi‑Fi status atom. */
  const fetchWifiStatus = useCallback(async () => {
    if (!connectedDevice) {
      return null;
    }

    try {
      const data = await bleManager.read(
        connectedDevice.id,
        BLE_SERVICE_UUID,
        WIFI_STATUS_CHAR_UUID,
      );
      const status = parseWifiStatusData(data);
      setWifiStatus(status);
      return status;
    } catch (e) {
      console.error('Failed to read WiFi status', e);
      setWifiStatus(null);
      return null;
    }
  }, [connectedDevice, setWifiStatus]);

  return { fetchWifiStatus };
};

export default useBleWifiStatus;
