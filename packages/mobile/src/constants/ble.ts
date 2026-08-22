import type { WifiStatusCode } from '@/types';

/**
 * Advertised / expected BLE peripheral name used when scanning for the monitor.
 */
export const BLE_DEVICE_NAME = 'ESP32-Monitor';

/**
 * Custom GATT service UUID for the ambient monitor peripheral.
 */
export const BLE_SERVICE_UUID = '43373C9D-F63D-4C72-A978-ABD8523DABFB';

/**
 * Characteristic UUID for writing Wi‑Fi SSID / password configuration.
 */
export const WIFI_CONFIG_CHAR_UUID = '5FD5AD97-4A4E-4E7E-BB31-7D69E179D965';

/**
 * Characteristic UUID for reading the device Wi‑Fi connection status payload.
 */
export const WIFI_STATUS_CHAR_UUID = '76B20411-217E-49E4-87DE-D544FB19A443';

/**
 * Characteristic UUID for live measurement notifications / reads (12-byte payload).
 */
export const MEASUREMENT_CHAR_UUID = '1DE752AB-EA22-4757-85B2-AC35C7FBB5E1';

/**
 * Maps the first byte of the Wi‑Fi status characteristic to a `WifiStatusCode`.
 *
 * Unknown numeric values should fall back to `not_configured` at the call site.
 */
export const STATUS_MAP: Record<number, WifiStatusCode> = {
  0: 'not_configured',
  1: 'configured',
  2: 'connecting',
  3: 'connected',
  4: 'failed',
};
