import { useAtomValue } from "jotai";

import { bleDataAvailabilityAtom } from "@/atoms";
import useBleMeasurement from "@/hooks/measurements/useBleMeasurement";
import useCloudLiveMeasurement from "@/hooks/measurements/useCloudLiveMeasurement";

const useLiveMeasurement = () => {
  const bleDataAvailability = useAtomValue(bleDataAvailabilityAtom);
  const ble = useBleMeasurement();
  const cloud = useCloudLiveMeasurement();

  if (bleDataAvailability === "usable") {
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
