import { useAtomValue } from 'jotai';
import { useEffect } from 'react';

import { connectedDeviceIdAtom } from '@/atoms';
import { bleManager } from '@/lib';

/**
 * Subscribes to native BLE adapter state changes and reconnects to the last
 * known device when Bluetooth turns back on.
 *
 * The hook does nothing when no connected device id is stored. The listener is
 * removed automatically when the component unmounts or the stored device id
 * changes.
 *
 * @param autoConnectToDevice - Connects to the given device id if it is not already connected.
 *
 * @example
 * const { autoConnectToDevice } = useBleConnect();
 * useBleAutoReconnect(autoConnectToDevice);
 */
const useBleAutoReconnect = (autoConnectToDevice: (deviceId: string) => Promise<void>) => {
  const connectedDeviceId = useAtomValue(connectedDeviceIdAtom);

  useEffect(() => {
    if (!connectedDeviceId) {
      return;
    }

    const subscription = bleManager.onDidUpdateState(async ({ state }: { state: string }) => {
      if (state === 'on') {
        await autoConnectToDevice(connectedDeviceId);
      }
    });

    bleManager.checkState();

    return () => subscription.remove();
  }, [autoConnectToDevice, connectedDeviceId]);
};

export default useBleAutoReconnect;
