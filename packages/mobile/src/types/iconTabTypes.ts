import type { Entypo } from '@expo/vector-icons';

import type { MeasurementKey } from '@/types/measurementTypes';

export interface MeasurementTabItem {
  key: MeasurementKey;
  label: string;
  iconName: keyof typeof Entypo.glyphMap;
}
