import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import type { Peripheral } from 'react-native-ble-manager';

import { bleMeasurementAtom, connectedDeviceAtom } from '@/atoms';
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';
import type { BleMeasurement } from '@/types';

interface DidUpdateValueForCharacteristicArgs {
  value: number[];
  peripheral: string;
  characteristic: string;
  service: string;
}

/** Parsed fields from a 12-byte BLE measurement characteristic payload. */
export interface DecodedBleMeasurementPayload {
  /** Temperature in Celsius. */
  temperature: number;
  /** Humidity in percent. */
  humidity: number;
  /** Pressure in hPa. */
  pressure: number;
  /** Unix epoch seconds from the device. */
  timestamp: number;
}

interface UseBleMeasurementResult {
  /** Latest decoded BLE measurement, or `null` when unavailable. */
  data: BleMeasurement | null;
  /** `true` while the initial read / notification setup is in progress. */
  isLoading: boolean;
}

/**
 * Decodes a raw BLE measurement characteristic payload.
 *
 * Binary layout (little-endian, 12 bytes):
 * - offset 0: temperature (int16, scaled by 100)
 * - offset 2: humidity (int16, scaled by 100)
 * - offset 4: pressure (int32, Pa; divide by 100 to get hPa)
 * - offset 8: timestamp (uint32, Unix epoch seconds)
 *
 * @param payload - Raw characteristic bytes.
 * @returns Parsed measurement values in human-readable units.
 */
export const decodeMeasurement = (payload: number[]): DecodedBleMeasurementPayload => {
  const buffer = new Uint8Array(payload).buffer;
  const view = new DataView(buffer);

  return {
    temperature: view.getInt16(0, true) / 100,
    humidity: view.getInt16(2, true) / 100,
    pressure: view.getInt32(4, true) / 100,
    timestamp: view.getUint32(8, true),
  };
};

/**
 * Subscribes to live BLE measurements for the currently connected peripheral.
 *
 * When a device is connected, reads the measurement characteristic once, starts
 * notifications, and keeps `bleMeasurementAtom` in sync. Short payloads
 * (under 12 bytes) clear the stored measurement. On disconnect, loading ends
 * and the stored measurement is cleared.
 *
 * @returns Current BLE measurement data and loading flag.
 * @example
 * ```tsx
 * const { data, isLoading } = useBleMeasurement();
 * ```
 */
const useBleMeasurement = (): UseBleMeasurementResult => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const [bleMeasurement, setBleMeasurement] = useAtom(bleMeasurementAtom);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Decodes a characteristic payload and writes it to `bleMeasurementAtom`.
   * Payloads shorter than 12 bytes clear the stored measurement.
   *
   * @param payload - Raw characteristic bytes to decode.
   */
  const updateBleMeasurement = useCallback(
    (payload: number[]) => {
      if (payload.length < 12) {
        setBleMeasurement(null);
        return;
      }

      const parsed = decodeMeasurement(payload);

      setBleMeasurement({
        temperature: parsed.temperature,
        humidity: parsed.humidity,
        pressure: parsed.pressure,
        createdAt: new Date(parsed.timestamp * 1000).toISOString(),
        receivedAt: Date.now(),
      });
    },
    [setBleMeasurement],
  );

  /**
   * Reads the current measurement once, then starts notifications for `device`.
   * Failures are logged; `isLoading` is always cleared in `finally`.
   *
   * @param device - Connected peripheral to monitor.
   */
  const startMonitoring = useCallback(
    async (device: Peripheral) => {
      setIsLoading(true);
      try {
        const payload = await bleManager.read(device.id, BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID);
        updateBleMeasurement(payload);

        await bleManager.startNotification(device.id, BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID);
      } catch (e) {
        console.error('Monitoring error', e);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, updateBleMeasurement],
  );

  useEffect(() => {
    if (!connectedDevice) {
      setIsLoading(false);
      setBleMeasurement(null);
      return;
    }

    startMonitoring(connectedDevice);

    // Apply notification payloads that match this device + measurement characteristic.
    const subscription = bleManager.onDidUpdateValueForCharacteristic(
      (dates: DidUpdateValueForCharacteristicArgs) => {
        const isTargetDevice = dates.peripheral === connectedDevice.id;
        const isTargetService = dates.service.toLowerCase() === BLE_SERVICE_UUID.toLowerCase();
        const isTargetChar =
          dates.characteristic.toLowerCase() === MEASUREMENT_CHAR_UUID.toLowerCase();

        if (isTargetDevice && isTargetService && isTargetChar) {
          updateBleMeasurement(dates.value);
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [connectedDevice, updateBleMeasurement, setBleMeasurement, startMonitoring]);

  return { data: bleMeasurement, isLoading };
};

export default useBleMeasurement;
