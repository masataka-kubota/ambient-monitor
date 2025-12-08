export type MeasurementKey = "temperature" | "humidity" | "pressure";

export interface MeasurementSetting {
  min: number;
  max: number;
  unit: string;
  decimals: number;
}
export type MeasurementSettings = Record<MeasurementKey, MeasurementSetting>;
