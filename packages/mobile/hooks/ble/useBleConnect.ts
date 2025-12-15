import { useSetAtom } from "jotai";
import { useCallback } from "react";
import { Device } from "react-native-ble-plx";

import { connectedDeviceAtom, scannedDevicesAtom } from "@/atoms";
import { bleManager } from "@/lib";

const useBleConnect = () => {
  const setConnectedDevice = useSetAtom(connectedDeviceAtom);
  const setScannedDevices = useSetAtom(scannedDevicesAtom);

  const connectToDevice = useCallback(
    async (device: Device) => {
      try {
        const connectedDevice = await bleManager.connectToDevice(device.id);
        await connectedDevice.discoverAllServicesAndCharacteristics();
        setConnectedDevice(connectedDevice);
        setScannedDevices((prev) => prev.filter((d) => d.id !== device.id));
      } catch (error) {
        console.error("Connection failed:", error);
      }
    },
    [setConnectedDevice, setScannedDevices],
  );

  const autoConnectToDevice = useCallback(async (device: Device) => {
    try {
      const connectedDevice = await bleManager.connectToDevice(device.id);
      await connectedDevice.discoverAllServicesAndCharacteristics();
      return true;
    } catch (error) {
      console.error("Auto connection failed:", error);
      return false;
    }
  }, []);

  const disconnectDevice = useCallback(
    async (device: Device) => {
      try {
        await bleManager.cancelDeviceConnection(device.id);
        setConnectedDevice(null);
      } catch (error) {
        console.error(`Failed to disconnect: ${device.id}`, error);
      }
    },
    [setConnectedDevice],
  );

  return { connectToDevice, autoConnectToDevice, disconnectDevice };
};

export default useBleConnect;
