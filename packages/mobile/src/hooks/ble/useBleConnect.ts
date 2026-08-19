import { useSetAtom } from 'jotai';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import type { Peripheral } from 'react-native-ble-manager';

import { connectedDeviceAtom, connectedDeviceIdAtom, scannedDevicesAtom } from '@/atoms';
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from '@/constants/ble';
import { bleManager } from '@/lib';

/**
 * Returns the discovered peripheral metadata for the given BLE device id.
 *
 * @param deviceId - The BLE peripheral id to resolve.
 * @returns The matching peripheral information, or null when the device is not found.
 */
export const getDeviceData = async (deviceId: string): Promise<Peripheral | null> => {
  if (!deviceId) {
    return null;
  }

  const peripherals = await bleManager.getDiscoveredPeripherals();
  return peripherals.find((p) => p.id === deviceId) ?? null;
};

/**
 * Normalizes native BLE exceptions into a readable string for logging.
 *
 * @param error - The raw error thrown by the BLE manager.
 * @returns A human-readable error string.
 */
export const getBleErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const message = 'message' in error ? error.message : undefined;
    if (typeof message === 'string') {
      return message;
    }

    const nestedError = 'error' in error ? error.error : undefined;
    if (typeof nestedError === 'string') {
      return nestedError;
    }
  }

  return String(error);
};

/**
 * Determines whether a BLE error is the expected disconnect case encountered
 * during a reconnect attempt on Android.
 *
 * @param error - The BLE error to evaluate.
 * @returns True when the disconnect error is considered benign and safe to ignore.
 */
export const isExpectedBleError = (error: unknown): boolean =>
  getBleErrorMessage(error).toLowerCase().includes('disconnect');

export interface UseBleConnectResult {
  /**
   * Connects to a BLE device, retrieves its services, and updates the active device state.
   */
  connectToDevice: (deviceId: string) => Promise<void>;

  /**
   * Checks whether the peripheral is already connected and, if not, performs a reconnect.
   */
  autoConnectToDevice: (deviceId: string) => Promise<void>;

  /**
   * Disconnects from the device and clears the stored connected-device state.
   */
  disconnectDevice: (deviceId: string) => Promise<void>;

  /**
   * Clears the remembered connected device id without calling the native disconnect API.
   */
  forgetDevice: () => void;

  /**
   * Whether a BLE connection attempt is currently in progress.
   */
  isConnecting: boolean;
}

/**
 * Exposes the BLE connection lifecycle helpers used by the app.
 *
 * @returns Methods to connect, auto-reconnect, disconnect, or forget devices,
 * along with the current in-flight connection state.
 */
const useBleConnect = (): UseBleConnectResult => {
  const setConnectedIdDevice = useSetAtom(connectedDeviceIdAtom);
  const setConnectedDevice = useSetAtom(connectedDeviceAtom);
  const setScannedDevices = useSetAtom(scannedDevicesAtom);
  const [isConnecting, setIsConnecting] = useState(false);

  /**
   * Performs the actual BLE connection sequence, including service retrieval and MTU request on Android.
   */
  const performBleConnect = useCallback(
    async (deviceId: string) => {
      await bleManager.connect(deviceId);
      await bleManager.retrieveServices(deviceId);
      if (Platform.OS === 'android') {
        await bleManager.requestMTU(deviceId, 100);
      }
      const deviceData = await getDeviceData(deviceId);
      setConnectedDevice(deviceData);
    },
    [setConnectedDevice],
  );

  /**
   * Connects to a BLE device, retrieves its services, and updates the active device state.
   */
  const connectToDevice = useCallback(
    async (deviceId: string) => {
      setIsConnecting(true);
      try {
        await bleManager.stopScan();
        await performBleConnect(deviceId);
        setConnectedIdDevice(deviceId);
        setScannedDevices((prev) => prev.filter((d) => d.id !== deviceId));
      } catch (error) {
        console.error('Connection failed:', error);
      } finally {
        setIsConnecting(false);
      }
    },
    [performBleConnect, setConnectedIdDevice, setScannedDevices],
  );

  /**
   * Checks whether the peripheral is already connected and, if not, performs a reconnect.
   */
  const autoConnectToDevice = useCallback(
    async (deviceId: string) => {
      try {
        const isConnected = await bleManager.isPeripheralConnected(deviceId);
        if (!isConnected) {
          await performBleConnect(deviceId);
        }
      } catch (error: unknown) {
        if (isExpectedBleError(error)) {
          // Android often throws "Device disconnected" when the device
          // is already connected from another phone. This is an expected case.
          if (__DEV__) {
            console.info('[BLE] expected reconnect failure is dev:', getBleErrorMessage(error));
          }
          return;
        }

        console.error('[BLE] auto reconnect failed:', error);
      }
    },
    [performBleConnect],
  );

  /**
   * Disconnects from the device and clears the stored connected-device state.
   */
  const disconnectDevice = useCallback(
    async (deviceId: string) => {
      try {
        await bleManager.stopNotification(deviceId, BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID);
        await bleManager.disconnect(deviceId);
        setConnectedIdDevice(null);
        setConnectedDevice(null);
      } catch (error) {
        console.error(`Failed to disconnect: ${deviceId}`, error);
      }
    },
    [setConnectedDevice, setConnectedIdDevice],
  );

  /**
   * Clears the remembered connected device id without calling the native disconnect API.
   * Used in the reconnect screen to allow users to set up a new device.
   */
  const forgetDevice = useCallback(() => {
    setConnectedIdDevice(null);
  }, [setConnectedIdDevice]);

  return {
    connectToDevice,
    autoConnectToDevice,
    disconnectDevice,
    forgetDevice,
    isConnecting,
  };
};

export default useBleConnect;
