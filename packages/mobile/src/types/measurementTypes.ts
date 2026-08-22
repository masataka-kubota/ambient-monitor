import type { MEASUREMENT_KEYS, MEASUREMENT_RANGES } from '@/constants';

/**
 * Metric identifier for live / historical measurements (`temperature` | `humidity` | `pressure`).
 */
export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number];

/**
 * Display bounds and formatting for a single measurement metric (gauge / chart).
 */
export interface MeasurementSetting {
  min: number;
  max: number;
  unit: string;
  decimals: number;
}

/**
 * Per-metric display settings keyed by `MeasurementKey`.
 */
export type MeasurementSettings = Record<MeasurementKey, MeasurementSetting>;

/**
 * Historical lookback period key (`1d` | `7d` | `30d`).
 */
export type MeasurementRange = (typeof MEASUREMENT_RANGES)[number];

/**
 * Decoded BLE live sample plus client-side timing metadata.
 *
 * - `createdAt` — device timestamp as ISO-8601
 * - `receivedAt` — local receive time (`Date.now()`), used for staleness checks
 */
export interface BleMeasurement {
  temperature: number;
  humidity: number;
  pressure: number;
  createdAt: string;
  receivedAt: number;
}

/**
 * Whether BLE live data can drive the UI (see `bleDataAvailabilityAtom`).
 *
 * - `unknown` — connected but no sample yet
 * - `usable` — connected with a fresh sample
 * - `unusable` — disconnected or sample older than the stale threshold
 */
export type BleDataAvailability = 'unknown' | 'usable' | 'unusable';
