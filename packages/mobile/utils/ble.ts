import { STATUS_MAP } from "@/constants/ble";
import { WifiStatus, WifiStatusCode } from "@/types";

// Measurement binary → JSON
export const decodeMeasurement = (base64Value: string) => {
  const binary = atob(base64Value);

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const view = new DataView(bytes.buffer);

  return {
    temperature: view.getInt16(0, true) / 100,
    humidity: view.getInt16(2, true) / 100,
    pressure: view.getInt32(4, true) / 100, // Pa → hPa
    timestamp: view.getUint32(8, true),
  };
};

// WifiStatus binary → JSON
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
