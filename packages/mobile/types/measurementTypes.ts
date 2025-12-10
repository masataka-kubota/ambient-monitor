import { MEASUREMENT_KEYS, MEASUREMENT_RANGES } from "@/constants";

export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

export interface MeasurementSetting {
  min: number;
  max: number;
  unit: string;
  decimals: number;
}
export type MeasurementSettings = Record<MeasurementKey, MeasurementSetting>;

export type MeasurementRange = (typeof MEASUREMENT_RANGES)[number];
