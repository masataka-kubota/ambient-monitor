import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";

import { bleMeasurementAtom, connectedDeviceAtom } from "@/atoms";
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from "@/constants/ble";
import { bleManager } from "@/lib";

interface DidUpdateValueForCharacteristicArgs {
  value: number[];
  peripheral: string;
  characteristic: string;
  service: string;
}

export const decodeMeasurement = (value: number[]) => {
  const buffer = new Uint8Array(value).buffer;
  const view = new DataView(buffer);

  return {
    temperature: view.getInt16(0, true) / 100,
    humidity: view.getInt16(2, true) / 100,
    pressure: view.getInt32(4, true) / 100, // Pa → hPa
    timestamp: view.getUint32(8, true),
  };
};

const useBleMeasurement = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const [bleMeasurement, setBleMeasurement] = useAtom(bleMeasurementAtom);
  const [isLoading, setIsLoading] = useState(true);

  const updateBleMeasurement = useCallback(
    (value: number[]) => {
      const parsed = decodeMeasurement(value);

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

  const startMonitoring = useCallback(async () => {
    if (!connectedDevice) return;

    setIsLoading(true);
    try {
      // Read initial value
      const bytes = await bleManager.read(
        connectedDevice.id,
        BLE_SERVICE_UUID,
        MEASUREMENT_CHAR_UUID,
      );
      updateBleMeasurement(bytes);

      // Start monitoring
      await bleManager.startNotification(
        connectedDevice.id,
        BLE_SERVICE_UUID,
        MEASUREMENT_CHAR_UUID,
      );
    } catch (e) {
      console.error("Monitoring error", e);
    } finally {
      setIsLoading(false);
    }
  }, [connectedDevice, setIsLoading, updateBleMeasurement]);

  useEffect(() => {
    if (!connectedDevice) {
      setIsLoading(false);
      setBleMeasurement(null);
      return;
    }

    // Start monitoring
    startMonitoring();

    // Subscription
    const subscription = bleManager.onDidUpdateValueForCharacteristic(
      (dates: DidUpdateValueForCharacteristicArgs) => {
        const isTargetDevice = dates.peripheral === connectedDevice.id;
        const isTargetService =
          dates.service.toLowerCase() === BLE_SERVICE_UUID.toLowerCase();
        const isTargetChar =
          dates.characteristic.toLowerCase() ===
          MEASUREMENT_CHAR_UUID.toLowerCase();

        if (isTargetDevice && isTargetService && isTargetChar) {
          updateBleMeasurement(dates.value);
        }
      },
    );

    return () => {
      subscription.remove();
      bleManager.stopNotification(
        connectedDevice.id,
        BLE_SERVICE_UUID,
        MEASUREMENT_CHAR_UUID,
      );
    };
  }, [
    connectedDevice,
    updateBleMeasurement,
    setBleMeasurement,
    startMonitoring,
  ]);

  return { data: bleMeasurement, isLoading };
};

export default useBleMeasurement;
