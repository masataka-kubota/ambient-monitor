import { Entypo } from "@expo/vector-icons";

import { MeasurementKey } from "@/types/measurementTypes";

export interface MeasurementTabItem {
  key: MeasurementKey;
  label: string;
  iconName: keyof typeof Entypo.glyphMap;
}
