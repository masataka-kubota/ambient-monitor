import type { z } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { testClient } from 'hono/testing'
import { SEED_MEASUREMENTS, TEST_DEVICE, TEST_ENV } from 'test/constants'

import app from '@/index'
import type {
  MeasurementLatestResponseSchema,
  NotFoundErrorSchema,
  UnauthorizedErrorSchema,
} from '@/schemas'

describe('GET /measurements/latest', () => {
  const client = testClient(app, env)
  const headerData = { Authorization: `Bearer ${TEST_ENV.EXPO_API_TOKEN}` }

  it('should return latest measurement', async () => {
    const res = await client.measurements.latest.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId },
    })

    expect(res.status).toBe(200)
    const json = (await res.json()) as z.infer<typeof MeasurementLatestResponseSchema>

    expect(json.success).toBe(true)
    expect(json.data).toBeDefined()
    expect(json.data.temperature).toBeDefined()
    expect(json.data.humidity).toBeDefined()
    expect(json.data.pressure).toBeDefined()

    // 最新の minutesAgo が一番小さいレコードかを確認
    const latestSeed = SEED_MEASUREMENTS.reduce((prev, cur) =>
      cur.minutesAgo < prev.minutesAgo ? cur : prev
    )
    expect(json.data.temperature).toBe(latestSeed.temperature)
    expect(json.data.humidity).toBe(latestSeed.humidity)
    expect(json.data.pressure).toBe(latestSeed.pressure)
  })

  // -------------------------
  // 401 tests
  // -------------------------
  it('should return 401 if Authorization header is missing', async () => {
    const res = await client.measurements.latest.$get({
      header: { Authorization: 'Bearer invalid-token' },
      query: { deviceId: TEST_DEVICE.externalId },
    })
    expect(res.status).toBe(401)
    const json = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(json.success).toBe(false)
    expect(json.error.message).toMatch(/Unauthorized error/i)
  })

  // -------------------------
  // 404 tests
  // -------------------------
  it('should return 404 if deviceId is missing', async () => {
    const res = await client.measurements.latest.$get({
      header: headerData,
      query: {},
    })
    expect(res.status).toBe(404)
    const json = (await res.json()) as z.infer<typeof NotFoundErrorSchema>
    expect(json.success).toBe(false)
    expect(json.error.message).toMatch(/Missing deviceId/i)
  })

  it('should return 404 if device does not exist', async () => {
    const res = await client.measurements.latest.$get({
      header: headerData,
      query: { deviceId: 'unknown' },
    })
    expect(res.status).toBe(404)
    const json = (await res.json()) as z.infer<typeof NotFoundErrorSchema>
    expect(json.success).toBe(false)
    expect(json.error.message).toMatch(/Device not found/i)
  })

  it('should return 404 if no measurements exist for device', async () => {
    const device = await env.DB.prepare(`SELECT id FROM devices WHERE external_id = ?`)
      .bind(TEST_DEVICE.externalId)
      .first<{ id: number }>()

    if (!device) throw new Error('Test device not found')

    // Remove measurements
    await env.DB.prepare(`DELETE FROM measurements WHERE device_id = ?`).bind(device.id).run()

    const res = await client.measurements.latest.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId },
    })

    expect(res.status).toBe(404)
    const json = (await res.json()) as z.infer<typeof NotFoundErrorSchema>
    expect(json.success).toBe(false)
    expect(json.error.message).toMatch(/Data not found/i)
  })
})
