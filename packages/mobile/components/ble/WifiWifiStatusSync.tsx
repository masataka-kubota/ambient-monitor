import { memo, useEffect } from "react";

import { useBleWifiStatus } from "@/hooks/ble";

const WifiWifiStatusSync = () => {
  const { fetchWifiStatus } = useBleWifiStatus();

  useEffect(() => {
    fetchWifiStatus();
  }, [fetchWifiStatus]);

  return null;
};

export default memo(WifiWifiStatusSync);
