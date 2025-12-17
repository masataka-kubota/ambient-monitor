import { useAtomValue } from "jotai";

import { connectedDeviceAtom } from "@/atoms";
import { BLE_MEASUREMENT_STALE_THRESHOLD_MS } from "@/constants";
import useBleMeasurement from "@/hooks/measurements/useBleMeasurement";
import useCloudLiveMeasurement from "@/hooks/measurements/useCloudLiveMeasurement";

const useLiveMeasurement = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);
  const ble = useBleMeasurement();
  const cloud = useCloudLiveMeasurement();

  const isBleFresh =
    connectedDevice &&
    ble.data &&
    Date.now() - ble.data.receivedAt < BLE_MEASUREMENT_STALE_THRESHOLD_MS;

  if (isBleFresh) {
    return {
      data: ble.data,
      isLoading: ble.isLoading,
      source: "ble" as const,
    };
  }

  return {
    data: cloud.data,
    isLoading: cloud.isLoading,
    source: "cloud" as const,
  };
};

export default useLiveMeasurement;
