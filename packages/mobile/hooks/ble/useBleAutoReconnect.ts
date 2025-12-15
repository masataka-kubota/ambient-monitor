import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { Device } from "react-native-ble-plx";

import { connectedDeviceAtom, isBleConnectedAtom } from "@/atoms";
import { bleManager } from "@/lib";

const useBleAutoReconnect = (
  autoConnectToDevice: (device: Device) => Promise<boolean>,
) => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);

  const setIsBleConnected = useSetAtom(isBleConnectedAtom);

  useEffect(() => {
    if (!connectedDevice) {
      setIsBleConnected(false);
      return;
    }

    const subscription = bleManager.onStateChange(async (state) => {
      if (state === "PoweredOn") {
        (async () => {
          try {
            const success = await autoConnectToDevice(connectedDevice);
            setIsBleConnected(success);
          } catch (error) {
            console.error("connection check error", error);
            setIsBleConnected(false);
          }
        })();

        subscription.remove();
      }
    }, true);

    return () => subscription.remove();
  }, [autoConnectToDevice, connectedDevice, setIsBleConnected]);
};

export default useBleAutoReconnect;
