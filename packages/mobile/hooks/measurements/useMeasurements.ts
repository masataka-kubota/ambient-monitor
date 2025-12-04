import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { selectedDeviceIdAtom } from "@/atoms";
import { API_TOKEN } from "@/constants";
import { apiClient } from "@/lib";

const useMeasurements = () => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  const onFetchMeasurements = async () => {
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

  const { data, isLoading } = useQuery({
    queryKey: ["measurements", selectedDeviceId],
    queryFn: onFetchMeasurements,
    refetchInterval: 5 * 60 * 1000,
  });

  return { data, isLoading };
};

export default useMeasurements;
