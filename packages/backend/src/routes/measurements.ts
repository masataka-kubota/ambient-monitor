import { OpenAPIHono } from '@hono/zod-openapi'
import type { SQL, SQLWrapper } from 'drizzle-orm'
import { and, asc, desc, eq, gte, lte } from 'drizzle-orm'

import { devices, measurements } from '@/db/schema'
import { createValidationHook } from '@/hooks'
import { createMeasurementRoute, listMeasurementsRoute } from '@/schemas'
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
    const {
      deviceId,
      startAt,
      endAt,
      limit: limitStr,
      offset: offsetStr,
      sort,
    } = c.req.valid('query')
    const limit = Number(limitStr) || 288 // 288 = 1 day (24h / 5min)
    const offset = Number(offsetStr) || 0

    if (!deviceId) {
      return c.json({ success: false, error: { message: 'Missing deviceId' } }, 404)
    }

    const device = await db.select().from(devices).where(eq(devices.externalId, deviceId)).get()
    if (!device) {
      return c.json({ success: false, error: { message: 'Device not found' } }, 404)
    }

    const conditions: SQLWrapper[] = [eq(measurements.deviceId, device.id)]

    if (startAt) {
      conditions.push(gte(measurements.createdAt, startAt))
    }

    if (endAt) {
      conditions.push(lte(measurements.createdAt, endAt))
    }

    const order: SQL = sort === 'asc' ? asc(measurements.createdAt) : desc(measurements.createdAt)

    const data = await db
      .select()
      .from(measurements)
      .where(and(...conditions))
      .orderBy(order)
      .limit(limit)
      .offset(offset)
      .all()

    return c.json({ success: true, data }, 200)
  })

export default measurementsApp
