import { useSetAtom } from "jotai";

import { scannedDevicesAtom } from "@/atoms";
import { BLE_DEVICE_NAME, BLE_SERVICE_UUID } from "@/constants/ble";
import { bleManager } from "@/lib";

const useBleScan = () => {
  const setScannedDevices = useSetAtom(scannedDevicesAtom);

  const scanForPeripherals = () => {
    setScannedDevices([]);

    bleManager.startDeviceScan([BLE_SERVICE_UUID], null, (error, device) => {
      if (error || !device) {
        console.error(error);
        bleManager.stopDeviceScan();
        return;
      }

      if (device.localName?.startsWith(BLE_DEVICE_NAME)) {
        setScannedDevices((prev) =>
          prev.some((d) => d.id === device.id) ? prev : [...prev, device],
        );
        bleManager.stopDeviceScan();
      }
    });
  };

  return { scanForPeripherals };
};

export default useBleScan;
