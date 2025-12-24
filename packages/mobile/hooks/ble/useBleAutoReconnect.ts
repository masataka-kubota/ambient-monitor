import { useAtomValue } from "jotai";
import { useEffect } from "react";

import { connectedDeviceIdAtom } from "@/atoms";
import { bleManager } from "@/lib";

const useBleAutoReconnect = (
  autoConnectToDevice: (deviceId: string) => Promise<void>,
) => {
  const connectedDeviceId = useAtomValue(connectedDeviceIdAtom);

  useEffect(() => {
    if (!connectedDeviceId) return;

    const subscription = bleManager.onDidUpdateState(
      async ({ state }: { state: string }) => {
        if (state === "on") {
          await autoConnectToDevice(connectedDeviceId);
        }
      },
    );

    bleManager.checkState();

    return () => subscription.remove();
  }, [autoConnectToDevice, connectedDeviceId]);
};

export default useBleAutoReconnect;
