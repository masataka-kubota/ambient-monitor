import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { selectedDeviceIdAtom } from "@/atoms";
import { apiClient } from "@/lib";

const API_TOKEN = process.env.EXPO_PUBLIC_EXPO_API_TOKEN || "";

const useLiveMeasurement = () => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  const onFetchMeasurements = async () => {
    const res = await apiClient.measurements.$get({
      header: { Authorization: `Bearer ${API_TOKEN}` },
      query: { deviceId: selectedDeviceId, limit: "1", offset: "0" }, // Get the latest measurement
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error("Failed to fetch measurements");
    }

    return data.data[0]; // Return the latest measurement
  };

  const { data, isLoading } = useQuery({
    queryKey: ["liveMeasurement", selectedDeviceId],
    queryFn: onFetchMeasurements,
    refetchInterval: 5 * 60 * 1000,
  });

  return { data, isLoading };
};

export default useLiveMeasurement;
