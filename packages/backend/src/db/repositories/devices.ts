import { desc, eq } from 'drizzle-orm'

import { devices, measurements } from '@/db/schema'
import type { AppDatabase } from '@/types'

/**
 * Find a device by its public `externalId`.
 *
 * @param db - Schema-typed Drizzle client
 * @param externalId - Device external ID (e.g. from `X-Device-Id`)
 * @returns The device row, or `undefined` if not found
 */
export const findDeviceByExternalId = (db: AppDatabase, externalId: string) => {
  return db.query.devices.findFirst({
    where: eq(devices.externalId, externalId),
  })
}

/**
 * Find a device by `externalId` and include its newest measurement.
 *
 * Uses the `devices` → `measurements` relation (`orderBy` createdAt desc, `limit` 1).
 *
 * @param db - Schema-typed Drizzle client
 * @param externalId - Device external ID
 * @returns The device with `measurements` (0 or 1 item), or `undefined` if the device is missing
 */
export const findDeviceWithLatestMeasurement = (db: AppDatabase, externalId: string) => {
  return db.query.devices.findFirst({
    where: eq(devices.externalId, externalId),
    with: {
      measurements: {
        orderBy: [desc(measurements.createdAt)],
        limit: 1,
      },
    },
  })
}
