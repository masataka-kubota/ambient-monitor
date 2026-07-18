import { and, eq, gte, sql } from 'drizzle-orm'

import { measurements } from '@/db/schema'
import type { AppDatabase } from '@/types'

/**
 * One time-bucket row returned by {@link listMeasurementBuckets}.
 *
 * Missing buckets are filled with `null` metric values so the series is contiguous.
 */
interface MeasurementBucketRow {
  /** UTC bucket start as `YYYY-MM-DD HH:MM:SS`. */
  bucketStart: string
  temperature: number | null
  humidity: number | null
  pressure: number | null
}

/** Parameters for aggregating measurements into fixed-width time buckets. */
interface ListMeasurementBucketsParams {
  /** Internal numeric device primary key (`devices.id`). */
  deviceId: number
  /** Lookback window in days (e.g. `1` for period `1d`). */
  days: number
  /** Bucket width in minutes (from `PERIOD_INTERVAL_MINUTES`). */
  intervalMinutes: number
}

/**
 * Aggregate a device's measurements into time buckets and fill gaps with nulls.
 *
 * Runs a SQLite `AVG` / `GROUP BY` over `createdAt`, then expands the result so every
 * bucket in `[now - days, now]` is present (empty buckets have null metrics).
 *
 * @param db - Schema-typed Drizzle client
 * @param params - Device id, lookback days, and bucket interval
 * @returns Contiguous bucket rows ordered from oldest to newest
 */
export const listMeasurementBuckets = async (
  db: AppDatabase,
  { deviceId, days, intervalMinutes }: ListMeasurementBucketsParams
): Promise<MeasurementBucketRow[]> => {
  const intervalSec = intervalMinutes * 60

  const dayStartSec = sql<number>`CAST(STRFTIME('%s', DATE('now', 'utc')) AS INTEGER)`

  const bucket = sql<number>`
    CAST(
      (
        CAST(STRFTIME('%s', ${measurements.createdAt}) AS INTEGER)
        - ${dayStartSec}
      ) / ${intervalSec}
    AS INTEGER)
  `

  // Formatted as UTC TEXT
  const bucketStart = sql<string>`
    STRFTIME(
      '%Y-%m-%d %H:%M:%S',
      ${dayStartSec} + (${bucket} * ${intervalSec}),
      'unixepoch'
    )
  `

  const sqlRows = await db
    .select({
      bucketStart,
      temperature: sql<number>`ROUND(AVG(${measurements.temperature}), 2)`,
      humidity: sql<number>`ROUND(AVG(${measurements.humidity}), 2)`,
      pressure: sql<number>`ROUND(AVG(${measurements.pressure}), 2)`,
    })
    .from(measurements)
    .where(
      and(
        eq(measurements.deviceId, deviceId),
        gte(measurements.createdAt, sql`DATETIME('now', '-' || ${days} || ' days')`)
      )
    )
    .groupBy(bucket)
    .orderBy(bucket)
    .all()

  // Fill missing buckets with null
  const rowMap = new Map(sqlRows.map((r) => [r.bucketStart, r]))

  const nowSec = Math.floor(Date.now() / 1000)
  const startSec = nowSec - days * 24 * 60 * 60

  const bucketTimes: string[] = []
  let cursor = startSec - (startSec % intervalSec)

  while (cursor <= nowSec) {
    const text = new Date(cursor * 1000).toISOString().slice(0, 19).replace('T', ' ')
    bucketTimes.push(text)
    cursor += intervalSec
  }

  return bucketTimes.map((t) => {
    return (
      rowMap.get(t) ?? {
        bucketStart: t,
        temperature: null,
        humidity: null,
        pressure: null,
      }
    )
  })
}
