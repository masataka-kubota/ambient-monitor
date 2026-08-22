import type { MeasurementSettings } from '@/types';

/**
 * Ordered metric keys shown in live / historical measurement UI.
 */
export const MEASUREMENT_KEYS = ['temperature', 'humidity', 'pressure'] as const;

/**
 * Display bounds, unit, and decimal places per measurement metric (gauges / charts).
 */
export const MEASUREMENT_SETTINGS: MeasurementSettings = {
  temperature: { min: -5, max: 40, unit: '°C', decimals: 1 },
  humidity: { min: 0, max: 100, unit: '%', decimals: 0 },
  pressure: { min: 850, max: 1100, unit: 'hPa', decimals: 0 },
} as const;

/**
 * Lookback period keys for historical measurement queries (`1d` / `7d` / `30d`).
 */
export const MEASUREMENT_RANGES = ['1d', '7d', '30d'] as const;

/**
 * Max age of a BLE sample (ms) before `bleDataAvailabilityAtom` treats it as stale.
 *
 * 90 seconds.
 */
export const BLE_MEASUREMENT_STALE_THRESHOLD_MS = 90_000;

/**
 * Color stops for the temperature C-shape gauge gradient segments.
 */
export const TEMPERATURE_GRADIENTS = [
  { start: '#0000FF', end: '#00BFFF' },
  { start: '#00BFFF', end: '#4ad0ba' },
  { start: '#4ad0ba', end: '#FFFF00' },
  { start: '#FFFF00', end: '#FFA500' },
  { start: '#FFA500', end: '#FF4500' },
];

/**
 * Temperature (°C) breakpoints aligned with `TEMPERATURE_GRADIENTS` segments.
 */
export const TEMPERATURE_THRESHOLDS = [5, 10, 20, 28, 35];

/**
 * Color stops for the humidity C-shape gauge gradient segments.
 */
export const HUMIDITY_GRADIENTS = [
  { start: '#FF4500', end: '#FFA500' },
  { start: '#FFA500', end: '#FFFF00' },
  { start: '#FFFF00', end: '#4ad0ba' },
  { start: '#4ad0ba', end: '#00BFFF' },
  { start: '#00BFFF', end: '#0000FF' },
];

/**
 * Humidity (%) breakpoints aligned with `HUMIDITY_GRADIENTS` segments.
 */
export const HUMIDITY_THRESHOLDS = [40, 50, 60, 70, 80];

/**
 * Color stops for the pressure C-shape gauge gradient segments.
 */
export const PRESSURE_GRADIENTS = [
  { start: '#FF4500', end: '#FFA500' },
  { start: '#FFA500', end: '#FFFF00' },
  { start: '#FFFF00', end: '#4ad0ba' },
];

/**
 * Pressure (hPa) breakpoints aligned with `PRESSURE_GRADIENTS` segments.
 */
export const PRESSURE_THRESHOLDS = [950, 985, 1000];
