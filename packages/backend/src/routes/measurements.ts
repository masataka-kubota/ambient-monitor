import { OpenAPIHono } from '@hono/zod-openapi'

import { PERIOD_INTERVAL_MINUTES } from '@/constants'
import { findDeviceByExternalId, findDeviceWithLatestMeasurement } from '@/db/repositories/devices'
import { listMeasurementBuckets } from '@/db/repositories/measurements'
import { measurements } from '@/db/schema'
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

    const device = await findDeviceByExternalId(db, deviceIdStr)

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
    const intervalMinutes = PERIOD_INTERVAL_MINUTES[period]
    const days = parseInt(period.replace('d', ''), 10)

    if (!deviceId) {
      return c.json({ success: false, error: { message: 'Missing deviceId' } }, 404)
    }

    const device = await findDeviceByExternalId(db, deviceId)
    if (!device) {
      return c.json({ success: false, error: { message: 'Device not found' } }, 404)
    }

    const data = await listMeasurementBuckets(db, {
      deviceId: device.id,
      days,
      intervalMinutes,
    })

    return c.json({ success: true, data }, 200)
  })

  // GET /measurements/latest
  .openapi(latestMeasurementRoute, async (c) => {
    const db = c.var.db
    const { deviceId } = c.req.valid('query')

    if (!deviceId) {
      return c.json({ success: false, error: { message: 'Missing deviceId' } }, 404)
    }

    const device = await findDeviceWithLatestMeasurement(db, deviceId)
    if (!device) {
      return c.json({ success: false, error: { message: 'Device not found' } }, 404)
    }

    const latestMeasurement = device.measurements[0]
    if (!latestMeasurement) {
      return c.json({ success: false, error: { message: 'Data not found' } }, 404)
    }

    return c.json({ success: true, data: latestMeasurement }, 200)
  })
export default measurementsApp
