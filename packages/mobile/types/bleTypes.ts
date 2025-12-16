export type WifiStatusCode =
  | "not_configured"
  | "configured"
  | "connecting"
  | "connected"
  | "failed";

export interface WifiStatus {
  status: WifiStatusCode;
  ssid?: string;
}
