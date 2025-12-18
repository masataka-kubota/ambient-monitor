import { atom } from "jotai";

import { connectedDeviceAtom } from "@/atoms/bleAtom";
import { BLE_MEASUREMENT_STALE_THRESHOLD_MS } from "@/constants";
import { BleDataAvailability, BleMeasurement } from "@/types";

export const bleMeasurementAtom = atom<BleMeasurement | null>(null);

export const bleDataAvailabilityAtom = atom<BleDataAvailability>((get) => {
  const connectedDevice = get(connectedDeviceAtom);
  const bleMeasurementData = get(bleMeasurementAtom);

  if (!connectedDevice) return "unusable";
  if (!bleMeasurementData) return "unknown";

  return Date.now() - bleMeasurementData.receivedAt <
    BLE_MEASUREMENT_STALE_THRESHOLD_MS
    ? "usable"
    : "unusable";
});
