import { useAtomValue } from 'jotai';
import { useCallback } from 'react';

import { connectedDeviceAtom } from '@/atoms';
import { BLE_SERVICE_UUID, WIFI_CONFIG_CHAR_UUID } from '@/constants/ble';
import useBleWifiStatus from '@/hooks/ble/useBleWifiStatus';
import { bleManager } from '@/lib';
import type { WifiFormValues, WifiStatus } from '@/types';

/**
 * Maximum length of the Wi‑Fi SSID field in the BLE payload, in bytes.
 * The ESP32 stores this value in a fixed-size 32-byte buffer.
 */
export const WIFI_SSID_MAX_LEN = 32;

/**
 * Maximum length of the Wi‑Fi password field in the BLE payload, in bytes.
 * The ESP32 stores this value in a fixed-size 64-byte buffer.
 */
export const WIFI_PASSWORD_MAX_LEN = 64;

/**
 * Total size of the fixed Wi‑Fi configuration payload, in bytes.
 * It is the sum of the SSID and password field sizes.
 */
export const WIFI_CONFIG_PAYLOAD_LEN = WIFI_SSID_MAX_LEN + WIFI_PASSWORD_MAX_LEN;

/**
 * Builds the fixed-size BLE payload used to configure Wi‑Fi credentials.
 *
 * The payload stores the SSID in the first 32 bytes and the password in the
 * following 64 bytes, both as UTF-8 strings padded with null bytes.
 *
 * @param values - SSID and password values to encode for the ESP32.
 * @returns A fixed-length byte array compatible with the Wi‑Fi config characteristic.
 *
 * @example
 * buildWifiConfigPayload({ ssid: 'Home-WiFi', password: 'secret' });
 * // => Uint8Array of length 96, with the SSID and password written at fixed offsets
 */
export const buildWifiConfigPayload = (values: WifiFormValues): Uint8Array => {
  const buffer = Buffer.alloc(WIFI_CONFIG_PAYLOAD_LEN);

  buffer.write(values.ssid, 0, WIFI_SSID_MAX_LEN, 'utf8');
  buffer.write(values.password, WIFI_SSID_MAX_LEN, WIFI_PASSWORD_MAX_LEN, 'utf8');

  return buffer;
};

export interface UseBleWifiActionsResult {
  /**
   * Clears the Wi‑Fi configuration on the device and refreshes the status from the BLE characteristic.
   */
  initializeWifiConfig: () => Promise<WifiStatus | null>;

  /**
   * Writes the provided SSID and password to the device and refreshes the status from the BLE characteristic.
   */
  updateWifiConfig: (values: WifiFormValues) => Promise<WifiStatus | null>;
}

/**
 * Exposes helper methods for writing Wi‑Fi configuration to the connected BLE
 * device and immediately refreshing the stored status from the device.
 *
 * @returns Methods to initialize the Wi‑Fi settings to blank values or update
 * them with a new SSID/password pair.
 *
 * @example
 * const { initializeWifiConfig, updateWifiConfig } = useBleWifiActions();
 * await updateWifiConfig({ ssid: 'Home-WiFi', password: 'secret' });
 */
const useBleWifiActions = (): UseBleWifiActionsResult => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const { fetchWifiStatus } = useBleWifiStatus();

  /**
   * Writes a Wi‑Fi SSID/password pair to the device and refreshes the stored
   * status from the BLE characteristic.
   *
   * @param values - The SSID and password to write to the device.
   * @param errorMessage - The error message to display if the write operation fails.
   * @returns The latest Wi‑Fi status after the write operation, or null if the
   * device is not connected or an error occurred.
   */
  const writeWifiConfig = useCallback(
    async (values: WifiFormValues, errorMessage: string): Promise<WifiStatus | null> => {
      if (!connectedDevice) {
        return null;
      }

      try {
        const payload = buildWifiConfigPayload(values);

        await bleManager.write(
          connectedDevice.id,
          BLE_SERVICE_UUID,
          WIFI_CONFIG_CHAR_UUID,
          Array.from(payload),
          WIFI_CONFIG_PAYLOAD_LEN,
        );

        return fetchWifiStatus();
      } catch (e) {
        console.error(errorMessage, e);
        return null;
      }
    },
    [connectedDevice, fetchWifiStatus],
  );

  /**
   * Resets the device's Wi‑Fi configuration to an empty state and fetches the
   * latest status from the BLE characteristic.
   */
  const initializeWifiConfig = useCallback(
    () => writeWifiConfig({ ssid: '', password: '' }, 'Failed to initialize Wi-Fi'),
    [writeWifiConfig],
  );

  /**
   * Writes a Wi‑Fi SSID/password pair to the device and refreshes the device
   * status afterwards so the UI reflects the current connection state.
   *
   * @param values - The SSID and password to write to the device.
   * @returns The latest Wi‑Fi status after the write operation, or null if the
   * device is not connected or an error occurred.
   */
  const updateWifiConfig = useCallback(
    (values: WifiFormValues) => writeWifiConfig(values, 'Failed to write WiFi config'),
    [writeWifiConfig],
  );

  return { initializeWifiConfig, updateWifiConfig };
};

export default useBleWifiActions;
