import { useSetAtom } from "jotai";
import { useCallback } from "react";

import {
  connectedDeviceAtom,
  connectedDeviceIdAtom,
  scannedDevicesAtom,
} from "@/atoms";
import { bleManager } from "@/lib";

const useBleConnect = () => {
  const setConnectedIdDevice = useSetAtom(connectedDeviceIdAtom);
  const setConnectedDevice = useSetAtom(connectedDeviceAtom);
  const setScannedDevices = useSetAtom(scannedDevicesAtom);

  const connectToDevice = useCallback(
    async (deviceId: string) => {
      try {
        const connectedDevice = await bleManager.connectToDevice(deviceId);
        await connectedDevice.discoverAllServicesAndCharacteristics();
        await connectedDevice.requestMTU(100);
        setConnectedIdDevice(connectedDevice.id);
        setConnectedDevice(connectedDevice);
        setScannedDevices((prev) => prev.filter((d) => d.id !== deviceId));
      } catch (error) {
        console.error("Connection failed:", error);
      }
    },
    [setConnectedDevice, setConnectedIdDevice, setScannedDevices],
  );

  const autoConnectToDevice = useCallback(
    async (deviceId: string) => {
      try {
        const connectedDevice = await bleManager.connectToDevice(deviceId);
        await connectedDevice.discoverAllServicesAndCharacteristics();
        await connectedDevice.requestMTU(100);
        setConnectedDevice(connectedDevice);
        return true;
      } catch (error) {
        console.error("Auto connection failed:", error);
        return false;
      }
    },
    [setConnectedDevice],
  );

  const disconnectDevice = useCallback(
    async (deviceId: string) => {
      try {
        await bleManager.cancelDeviceConnection(deviceId);
        setConnectedIdDevice(null);
        setConnectedDevice(null);
      } catch (error) {
        console.error(`Failed to disconnect: ${deviceId}`, error);
      }
    },
    [setConnectedDevice, setConnectedIdDevice],
  );

  return { connectToDevice, autoConnectToDevice, disconnectDevice };
};

export default useBleConnect;
