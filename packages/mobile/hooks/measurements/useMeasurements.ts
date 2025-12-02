import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { selectedDeviceIdAtom } from "@/atoms";
import { apiClient } from "@/lib";

const API_TOKEN = process.env.EXPO_PUBLIC_EXPO_API_TOKEN || "";

const useMeasurements = () => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  const onFetchMeasurements = async () => {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const res = await apiClient.measurements.$get({
      header: { Authorization: `Bearer ${API_TOKEN}` },
      query: { deviceId: selectedDeviceId },
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error("Failed to fetch measurements");
    }
    return data.data;
  };

  const { data: measurements, isLoading } = useQuery({
    queryKey: ["measurements", selectedDeviceId],
    queryFn: onFetchMeasurements,
    refetchInterval: 5 * 60 * 1000,
  });

  return { measurements, isLoading };
};

export default useMeasurements;
