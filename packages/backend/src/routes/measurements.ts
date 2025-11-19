import { OpenAPIHono } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'

import { devices, measurements } from '@/db/schema'
import { createValidationHook } from '@/hooks'
import { createMeasurementRoute } from '@/schemas'
import type { D1Env } from '@/types'

const measurementsApp = new OpenAPIHono<D1Env>({
  defaultHook: createValidationHook<typeof createMeasurementRoute, D1Env>(),
}).openapi(createMeasurementRoute, async (c) => {
  const db = drizzle(c.env.DB)
  const { 'X-Device-Id': deviceIdStr } = c.req.valid('header')
  const { temperature, humidity, pressure } = c.req.valid('json')

  const device = await db.select().from(devices).where(eq(devices.deviceId, deviceIdStr)).get()

  if (!device) {
    return c.json(
      { success: false, error: { field: 'deviceId', message: 'Device not found' } },
      404
    )
  }

  await db
    .insert(measurements)
    .values({ deviceId: device.id, temperature, humidity, pressure })
    .returning()
  return c.json({ success: true }, 201)
})

export default measurementsApp
