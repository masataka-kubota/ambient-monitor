import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { selectedDeviceIdAtom } from "@/atoms";
import { API_TOKEN } from "@/constants";
import { apiClient } from "@/lib";

const useLiveMeasurement = () => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  const onFetchMeasurements = async () => {
    const res = await apiClient.measurements.latest.$get({
      header: { Authorization: `Bearer ${API_TOKEN}` },
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
  });

  return { data, isLoading };
};

export default useLiveMeasurement;
