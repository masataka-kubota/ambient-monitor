import { OpenAPIHono } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'

import { devices, measurements } from '@/db/schema'
import { createValidationHook } from '@/hooks'
import { createMeasurementRoute } from '@/schemas'
import type { Env } from '@/types'

const measurementsApp = new OpenAPIHono<Env>({
  defaultHook: createValidationHook<typeof createMeasurementRoute, Env>(),
}).openapi(createMeasurementRoute, async (c) => {
  const db = c.var.db
  const { 'X-Device-Id': deviceIdStr } = c.req.valid('header')
  const { temperature, humidity, pressure } = c.req.valid('json')

  const device = await db.select().from(devices).where(eq(devices.deviceId, deviceIdStr)).get()

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

export default measurementsApp
