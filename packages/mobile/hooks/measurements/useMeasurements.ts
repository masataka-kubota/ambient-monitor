import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { selectedDeviceIdAtom } from "@/atoms";
import { apiClient } from "@/lib";
import { MeasurementRange } from "@/types";

const useMeasurements = (range: MeasurementRange) => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  const fetchMeasurements = async () => {
    const res = await apiClient.measurements.$get({
      query: { deviceId: selectedDeviceId, period: range },
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error("Failed to fetch last 24h measurements");
    }

    return data.data;
  };

  return useQuery({
    queryKey: ["measurements24h", selectedDeviceId, range],
    queryFn: fetchMeasurements,
    refetchInterval: 5 * 60 * 1000,
  });
};

export default useMeasurements;
