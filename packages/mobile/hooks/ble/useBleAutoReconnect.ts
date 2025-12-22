import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";

import { connectedDeviceIdAtom, isBleConnectedAtom } from "@/atoms";
import { bleManager } from "@/lib";

const useBleAutoReconnect = (
  autoConnectToDevice: (deviceId: string) => Promise<boolean>,
) => {
  const connectedDeviceId = useAtomValue(connectedDeviceIdAtom);
  const setIsBleConnected = useSetAtom(isBleConnectedAtom);

  useEffect(() => {
    if (!connectedDeviceId) {
      setIsBleConnected(false);
      return;
    }

    const subscription = bleManager.onDidUpdateState(
      async ({ state }: { state: string }) => {
        if (state === "on") {
          try {
            const success = await autoConnectToDevice(connectedDeviceId);
            setIsBleConnected(success);
          } catch (error) {
            console.error("connection check error", error);
            setIsBleConnected(false);
          }
        }
      },
    );

    bleManager.checkState();

    return () => subscription.remove();
  }, [autoConnectToDevice, connectedDeviceId, setIsBleConnected]);
};

export default useBleAutoReconnect;
