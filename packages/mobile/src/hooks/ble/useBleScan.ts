import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import type { Peripheral } from 'react-native-ble-manager';

import { scannedDevicesAtom } from '@/atoms';
import { BLE_DEVICE_NAME, BLE_SERVICE_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';

export interface UseBleScanResult {
  /**
   * Clears the scanned device list and starts a filtered BLE scan for nearby
   * Ambient Monitor peripherals.
   */
  scanForPeripherals: () => Promise<void>;
}

/**
 * Discovers nearby Ambient Monitor peripherals and keeps the scanned device
 * list in sync with BLE scan events.
 *
 * The hook subscribes to discovery and scan-stop notifications on mount. Only
 * peripherals whose `name` or advertised `localName` starts with
 * `BLE_DEVICE_NAME` are added, and duplicates are ignored by device id.
 * Subscriptions are removed automatically when the component unmounts.
 *
 * @returns Helpers for starting a filtered BLE scan.
 *
 * @example
 * const { scanForPeripherals } = useBleScan();
 * await scanForPeripherals();
 */
const useBleScan = (): UseBleScanResult => {
  const setScannedDevices = useSetAtom(scannedDevicesAtom);

  useEffect(() => {
    const discoverSubscription = bleManager.onDiscoverPeripheral((peripheral: Peripheral) => {
      const name = peripheral.name ?? peripheral.advertising?.localName ?? '';

      if (name.startsWith(BLE_DEVICE_NAME)) {
        setScannedDevices((prev) =>
          prev.some((d) => d.id === peripheral.id) ? prev : [...prev, peripheral],
        );
      }
    });

    const stopSubscription = bleManager.onStopScan(() => {
      // Only log the scan stop event for debugging purposes.
      // console.log('Scan stopped');
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
