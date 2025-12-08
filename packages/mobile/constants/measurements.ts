import { MeasurementKey, MeasurementSettings } from "@/types";

// Measurement settings
export const MEASUREMENT_SETTINGS: MeasurementSettings = {
  temperature: { min: -5, max: 40, unit: "°C", decimals: 1 },
  humidity: { min: 0, max: 100, unit: "%", decimals: 0 },
  pressure: { min: 850, max: 1100, unit: "hPa", decimals: 0 },
} as const;

// Measurement keys
export const MEASUREMENT_KEYS = Object.keys(
  MEASUREMENT_SETTINGS,
) as MeasurementKey[];

// Gradients and thresholds
export const TEMPERATURE_GRADIENTS = [
  { start: "#0000FF", end: "#00BFFF" },
  { start: "#00BFFF", end: "#4ad0ba" },
  { start: "#4ad0ba", end: "#FFFF00" },
  { start: "#FFFF00", end: "#FFA500" },
  { start: "#FFA500", end: "#FF4500" },
];
export const TEMPERATURE_THRESHOLDS = [5, 10, 20, 28, 35];

export const HUMIDITY_GRADIENTS = [
  { start: "#FF4500", end: "#FFA500" },
  { start: "#FFA500", end: "#FFFF00" },
  { start: "#FFFF00", end: "#4ad0ba" },
  { start: "#4ad0ba", end: "#00BFFF" },
  { start: "#00BFFF", end: "#0000FF" },
];
export const HUMIDITY_THRESHOLDS = [40, 50, 60, 70, 80];

export const PRESSURE_GRADIENTS = [
  { start: "#FF4500", end: "#FFA500" },
  { start: "#FFA500", end: "#FFFF00" },
  { start: "#FFFF00", end: "#4ad0ba" },
];
export const PRESSURE_THRESHOLDS = [950, 985, 1000];
