import { useSetAtom } from "jotai";
import { useCallback, useState } from "react";
import { Platform } from "react-native";
import { Peripheral } from "react-native-ble-manager";

import {
  connectedDeviceAtom,
  connectedDeviceIdAtom,
  scannedDevicesAtom,
} from "@/atoms";
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from "@/constants/ble";
import { bleManager } from "@/lib";

export const getDeviceData = async (
  deviceId: string,
): Promise<Peripheral | null> => {
  if (!deviceId) return null;

  const peripherals = await bleManager.getDiscoveredPeripherals();
  return peripherals.find((p) => p.id === deviceId) ?? null;
};

const getBleErrorMessage = (error: unknown): string =>
  String((error as any)?.message ?? (error as any)?.error ?? error);

const isExpectedBleError = (error: unknown): boolean =>
  getBleErrorMessage(error).toLowerCase().includes("disconnect");

const useBleConnect = () => {
  const setConnectedIdDevice = useSetAtom(connectedDeviceIdAtom);
  const setConnectedDevice = useSetAtom(connectedDeviceAtom);
  const setScannedDevices = useSetAtom(scannedDevicesAtom);
  const [isConnecting, setIsConnecting] = useState(false);

  const performBleConnect = useCallback(
    async (deviceId: string) => {
      await bleManager.connect(deviceId);
      await bleManager.retrieveServices(deviceId);
      if (Platform.OS === "android") await bleManager.requestMTU(deviceId, 100);
      const deviceData = await getDeviceData(deviceId);
      setConnectedDevice(deviceData);
    },
    [setConnectedDevice],
  );

  const connectToDevice = useCallback(
    async (deviceId: string) => {
      setIsConnecting(true);
      try {
        await bleManager.stopScan();
        await performBleConnect(deviceId);
        setConnectedIdDevice(deviceId);
        setScannedDevices((prev) => prev.filter((d) => d.id !== deviceId));
      } catch (error) {
        console.error("Connection failed:", error);
      } finally {
        setIsConnecting(false);
      }
    },
    [performBleConnect, setConnectedIdDevice, setScannedDevices],
  );

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
            console.info(
              "[BLE] expected reconnect failure is dev:",
              getBleErrorMessage(error),
            );
          }
          return;
        }

        console.error("[BLE] auto reconnect failed:", error);
      }
    },
    [performBleConnect],
  );

  const disconnectDevice = useCallback(
    async (deviceId: string) => {
      try {
        await bleManager.stopNotification(
          deviceId,
          BLE_SERVICE_UUID,
          MEASUREMENT_CHAR_UUID,
        );
        await bleManager.disconnect(deviceId);
        setConnectedIdDevice(null);
        setConnectedDevice(null);
      } catch (error) {
        console.error(`Failed to disconnect: ${deviceId}`, error);
      }
    },
    [setConnectedDevice, setConnectedIdDevice],
  );

  // Forget the previously connected device.
  // This does NOT call bleManager.disconnect because the device is already disconnected.
  // Used in the reconnect screen to allow users to set up a new device.
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
