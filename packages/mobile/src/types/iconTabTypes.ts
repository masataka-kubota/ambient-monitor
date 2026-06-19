import type { EntypoIconName } from '@react-native-vector-icons/entypo/static';

import type { MeasurementKey } from '@/types/measurementTypes';

export interface MeasurementTabItem {
  key: MeasurementKey;
  label: string;
  iconName: EntypoIconName;
}
