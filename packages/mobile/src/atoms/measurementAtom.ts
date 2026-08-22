import { atom } from 'jotai';

import { connectedDeviceAtom } from '@/atoms/bleAtom';
import { BLE_MEASUREMENT_STALE_THRESHOLD_MS } from '@/constants';
import type { BleDataAvailability, BleMeasurement } from '@/types';

/**
 * Latest decoded BLE measurement for the connected peripheral, or `null`.
 *
 * In-memory only. Written by `useBleMeasurement` (initial read + notifications);
 * cleared on disconnect. Read by live measurement UI and
 * `bleDataAvailabilityAtom`.
 */
export const bleMeasurementAtom = atom<BleMeasurement | null>(null);

/**
 * Derived BLE data readiness for choosing live measurement source.
 *
 * Resolution order:
 * - `unusable` — no connected peripheral, or the latest measurement is older
 *   than `BLE_MEASUREMENT_STALE_THRESHOLD_MS` (90s)
 * - `unknown` — connected, but no measurement has been received yet
 * - `usable` — connected with a fresh measurement within the stale threshold
 *
 * Read by `useLiveMeasurement` to prefer BLE vs enable the cloud fallback.
 */
export const bleDataAvailabilityAtom = atom<BleDataAvailability>((get) => {
  const connectedDevice = get(connectedDeviceAtom);
  const bleMeasurementData = get(bleMeasurementAtom);

  if (!connectedDevice) {
    return 'unusable';
  }
  if (!bleMeasurementData) {
    return 'unknown';
  }

  return Date.now() - bleMeasurementData.receivedAt < BLE_MEASUREMENT_STALE_THRESHOLD_MS
    ? 'usable'
    : 'unusable';
});
