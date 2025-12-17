import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

import { connectedDeviceAtom } from "@/atoms";
import { BLE_SERVICE_UUID, MEASUREMENT_CHAR_UUID } from "@/constants/ble";
import { BleMeasurement, BleMeasurementPayload } from "@/types";
import { base64 } from "@/utils";

const useBleMeasurement = () => {
  const connectedDevice = useAtomValue(connectedDeviceAtom);

  const [isLoading, setIsLoading] = useState(true);
  const [bleMeasurement, setBleMeasurement] = useState<BleMeasurement | null>(
    null,
  );

  useEffect(() => {
    if (!connectedDevice) {
      setIsLoading(false);
      setBleMeasurement(null);
      return;
    }

    setIsLoading(true);

    const sub = connectedDevice.monitorCharacteristicForService(
      BLE_SERVICE_UUID,
      MEASUREMENT_CHAR_UUID,
      (error, char) => {
        if (error || !char?.value) return;

        const decoded = base64.decode(char.value);
        const parsed: BleMeasurementPayload = JSON.parse(decoded);

        setBleMeasurement({
          temperature: parsed.temperature,
          humidity: parsed.humidity,
          pressure: parsed.pressure,
          createdAt: new Date(parsed.timestamp * 1000).toISOString(), // UTC Unix time → ISO
          receivedAt: Date.now(),
        });
        setIsLoading(false);
      },
    );

    return () => sub.remove();
  }, [connectedDevice]);

  return { data: bleMeasurement, isLoading };
};

export default useBleMeasurement;
