/**
 * Wi‑Fi provisioning state reported by the BLE Wi‑Fi status characteristic.
 *
 * - `not_configured` — no credentials stored on the device
 * - `configured` — credentials present, not yet connected
 * - `connecting` — association / DHCP in progress
 * - `connected` — joined an access point
 * - `failed` — last connection attempt failed
 */
export type WifiStatusCode =
  | 'not_configured'
  | 'configured'
  | 'connecting'
  | 'connected'
  | 'failed';

/**
 * Parsed Wi‑Fi status from the device, including optional SSID when known.
 */
export interface WifiStatus {
  status: WifiStatusCode;
  ssid?: string;
}

/**
 * User input for writing Wi‑Fi credentials over BLE.
 */
export interface WifiFormValues {
  ssid: string;
  password: string;
}
