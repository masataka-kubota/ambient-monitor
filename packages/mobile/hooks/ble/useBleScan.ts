import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { Peripheral } from "react-native-ble-manager";

import { scannedDevicesAtom } from "@/atoms";
import { BLE_DEVICE_NAME, BLE_SERVICE_UUID } from "@/constants/ble";
import { bleManager } from "@/lib";

const useBleScan = () => {
  const setScannedDevices = useSetAtom(scannedDevicesAtom);

  useEffect(() => {
    const discoverSubscription = bleManager.onDiscoverPeripheral(
      (peripheral: Peripheral) => {
        const name = peripheral.name ?? peripheral.advertising?.localName ?? "";

        if (name.startsWith(BLE_DEVICE_NAME)) {
          setScannedDevices((prev) =>
            prev.some((d) => d.id === peripheral.id)
              ? prev
              : [...prev, peripheral],
          );
        }
      },
    );

    const stopSubscription = bleManager.onStopScan(() => {
      console.log("Scan stopped");
    });

    return () => {
      discoverSubscription.remove();
      stopSubscription.remove();
    };
  }, [setScannedDevices]);

  const scanForPeripherals = async () => {
    setScannedDevices([]);

    await bleManager.scan({
      serviceUUIDs: [BLE_SERVICE_UUID],
      seconds: 5,
      allowDuplicates: false,
    });
  };

  return { scanForPeripherals };
};

export default useBleScan;
