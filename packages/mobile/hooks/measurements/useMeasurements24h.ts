import { useQuery } from "@tanstack/react-query";
import { useAtomValue } from "jotai";

import { selectedDeviceIdAtom } from "@/atoms";
import { API_TOKEN } from "@/constants";
import { apiClient } from "@/lib";
import { formatToUtcTime } from "@/utils";

export const useMeasurements24h = () => {
  const selectedDeviceId = useAtomValue(selectedDeviceIdAtom);

  const fetch24h = async () => {
    const nowLocal = new Date();
    const sinceLocal = new Date(nowLocal.getTime() - 24 * 60 * 60 * 1000);
    const startAt = formatToUtcTime(sinceLocal);
    const endAt = formatToUtcTime(nowLocal);

    const res = await apiClient.measurements.$get({
      header: { Authorization: `Bearer ${API_TOKEN}` },
      query: { deviceId: selectedDeviceId, startAt, endAt, sort: "asc" },
    });

    const data = await res.json();

    if (!data.success) {
      throw new Error("Failed to fetch last 24h measurements");
    }

    return data.data;
  };

  return useQuery({
    queryKey: ["measurements24h", selectedDeviceId],
    queryFn: fetch24h,
    refetchInterval: 5 * 60 * 1000,
  });
};
