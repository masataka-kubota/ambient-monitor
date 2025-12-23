import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { bleDataAvailabilityAtom, selectedDeviceIdAtom } from "@/atoms";
import { apiClient } from "@/lib";

const useCloudLiveMeasurement = () => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);
  const bleDataAvailability = useAtomValue(bleDataAvailabilityAtom);

  const onFetchMeasurements = async () => {
    const res = await apiClient.measurements.latest.$get({
      query: { deviceId: selectedDeviceId },
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error("Failed to fetch measurements");
    }

    return data.data; // Return the latest measurement
  };

  const { data, isLoading } = useQuery({
    queryKey: ["liveMeasurement", selectedDeviceId],
    queryFn: onFetchMeasurements,
    refetchInterval: 5 * 60 * 1000,
    enabled: bleDataAvailability === "unusable",
  });

  return { data, isLoading };
};

export default useCloudLiveMeasurement;
