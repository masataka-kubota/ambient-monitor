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
      } catch (error) {
        console.error("Auto connection failed:", error);
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

  return {
    connectToDevice,
    autoConnectToDevice,
    disconnectDevice,
    isConnecting,
  };
};

export default useBleConnect;
