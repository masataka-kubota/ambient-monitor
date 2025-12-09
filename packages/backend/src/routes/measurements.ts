import { OpenAPIHono } from '@hono/zod-openapi'
import { and, desc, eq, gte, sql } from 'drizzle-orm'

import { PERIOD_INTERVAL_MINUTES } from '@/constants'
import { devices, measurements } from '@/db/schema'
import { createValidationHook } from '@/hooks'
import { createMeasurementRoute, latestMeasurementRoute, listMeasurementsRoute } from '@/schemas'
import type { Env } from '@/types'

const measurementsApp = new OpenAPIHono<Env>({
  defaultHook: createValidationHook<typeof createMeasurementRoute, Env>(),
})

  // POST /measurements
  .openapi(createMeasurementRoute, async (c) => {
    const db = c.var.db
    const { 'X-Device-Id': deviceIdStr } = c.req.valid('header')
    const { temperature, humidity, pressure } = c.req.valid('json')

    const device = await db.select().from(devices).where(eq(devices.externalId, deviceIdStr)).get()

    // Unreachable code: the JWT HMAC auth middleware ensures that a valid, active device exists.
    /* istanbul ignore next -- @preserve */
    if (!device) {
      throw new Error('Invariant violation: device should exist')
    }

    await db
      .insert(measurements)
      .values({ deviceId: device.id, temperature, humidity, pressure })
      .returning()

    return c.json({ success: true }, 201)
  })

  // GET /measurements
  .openapi(listMeasurementsRoute, async (c) => {
    const db = c.var.db
    const { deviceId, period } = c.req.valid('query')
    const interval = PERIOD_INTERVAL_MINUTES[period]
    const intervalSec = interval * 60
    const days = parseInt(period.replace('d', ''), 10)

    if (!deviceId) {
      return c.json({ success: false, error: { message: 'Missing deviceId' } }, 404)
    }

    const device = await db.select().from(devices).where(eq(devices.externalId, deviceId)).get()
    if (!device) {
      return c.json({ success: false, error: { message: 'Device not found' } }, 404)
    }

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
          eq(measurements.deviceId, device.id),
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

    const filled = bucketTimes.map((t) => {
      return (
        rowMap.get(t) ?? {
          bucketStart: t,
          temperature: null,
          humidity: null,
          pressure: null,
        }
      )
    })

    return c.json({ success: true, data: filled }, 200)
  })

  // GET /measurements/latest
  .openapi(latestMeasurementRoute, async (c) => {
    const db = c.var.db
    const { deviceId } = c.req.valid('query')

    if (!deviceId) {
      return c.json({ success: false, error: { message: 'Missing deviceId' } }, 404)
    }

    const device = await db.select().from(devices).where(eq(devices.externalId, deviceId)).get()
    if (!device) {
      return c.json({ success: false, error: { message: 'Device not found' } }, 404)
    }

    const latestMeasurement = await db
      .select()
      .from(measurements)
      .where(eq(measurements.deviceId, device.id))
      .orderBy(desc(measurements.createdAt))
      .limit(1)
      .get()

    if (!latestMeasurement) {
      return c.json({ success: false, error: { message: 'Data not found' } }, 404)
    }

    return c.json({ success: true, data: latestMeasurement }, 200)
  })
export default measurementsApp
