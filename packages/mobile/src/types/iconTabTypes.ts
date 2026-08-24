import type { EntypoIconName } from '@react-native-vector-icons/entypo/static';

import type { MeasurementKey } from '@/types/measurementTypes';

/**
 * Tab item for switching among temperature / humidity / pressure in measurement UI.
 */
export interface MeasurementTabItem {
  key: MeasurementKey;
  label: string;
  iconName: EntypoIconName;
}
