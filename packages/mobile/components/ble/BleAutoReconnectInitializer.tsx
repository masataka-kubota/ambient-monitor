import { memo } from "react";

import { useBleAutoReconnect, useBleConnect } from "@/hooks/ble";

const BleAutoReconnectInitializer = () => {
  const { autoConnectToDevice } = useBleConnect();
  useBleAutoReconnect(autoConnectToDevice);
  return null;
};

export default memo(BleAutoReconnectInitializer);
