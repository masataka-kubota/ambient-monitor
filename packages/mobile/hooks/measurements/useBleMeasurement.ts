import { useAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { BleError, Characteristic } from "react-native-ble-plx";

import { bleMeasurementAtom, connectedDeviceAtom } from "@/atoms";
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from "@/constants/ble";
import { BleMeasurementPayload } from "@/types";
import { base64 } from "@/utils";

const useBleMeasurement = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const [bleMeasurement, setBleMeasurement] = useAtom(bleMeasurementAtom);

  const [isLoading, setIsLoading] = useState(true);

  const updateBleMeasurement = useCallback(
    (base64Value: string) => {
      const decoded = base64.decode(base64Value);
      const parsed: BleMeasurementPayload = JSON.parse(decoded);

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

  const fetchInitialValue = useCallback(async () => {
    if (!connectedDevice) return;

    setIsLoading(true);
    try {
      const char = await connectedDevice.readCharacteristicForService(
        BLE_SERVICE_UUID,
        MEASUREMENT_CHAR_UUID,
      );
      if (char?.value) {
        updateBleMeasurement(char.value);
      }
    } catch (e) {
      console.error("Failed to read initial measurement", e);
    } finally {
      setIsLoading(false);
    }
  }, [connectedDevice, updateBleMeasurement]);

  const handleMeasurementUpdate = useCallback(
    (error: BleError | null, char: Characteristic | null) => {
      if (error || !char?.value) return;
      updateBleMeasurement(char.value);
    },
    [updateBleMeasurement],
  );

  useEffect(() => {
    if (!connectedDevice) {
      setIsLoading(false);
      setBleMeasurement(null);
      return;
    }

    // Fetch initial value
    fetchInitialValue();

    // Subscribe notifications
    const sub = connectedDevice.monitorCharacteristicForService(
      BLE_SERVICE_UUID,
      MEASUREMENT_CHAR_UUID,
      handleMeasurementUpdate,
    );

    return () => sub.remove();
  }, [
    connectedDevice,
    fetchInitialValue,
    handleMeasurementUpdate,
    setBleMeasurement,
  ]);

  return { data: bleMeasurement, isLoading };
};

export default useBleMeasurement;
