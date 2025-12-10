import { memo, useState } from "react";
import { View } from "react-native";

import DataGraph from "@/components/measurements/DataGraph";
import PeriodTabs from "@/components/measurements/PeriodTabs";
import { MeasurementRange } from "@/types";

const DataMeasurementsView = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<MeasurementRange>("1d");

  return (
    <View>
      <PeriodTabs
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />
      <DataGraph period={selectedPeriod} />
    </View>
  );
};

export default memo(DataMeasurementsView);
