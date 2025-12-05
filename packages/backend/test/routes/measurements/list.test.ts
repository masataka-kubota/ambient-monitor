import type { z } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { testClient } from 'hono/testing'
import { SEED_MEASUREMENTS, TEST_DEVICE, TEST_ENV } from 'test/constants'

import app from '@/index'
import type {
  MeasurementListResponseSchema,
  NotFoundErrorSchema,
  UnauthorizedErrorSchema,
  ValidationErrorSchema,
} from '@/schemas'

describe('GET /measurements', () => {
  // Create the test client from the app instance
  const client = testClient(app, env)

  const headerData = { Authorization: `Bearer ${TEST_ENV.EXPO_API_TOKEN}` }

  it('should return 200 with array of measurements', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId },
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>
    expect(data.success).toEqual(true)
    expect(data.data).toBeInstanceOf(Array)
  })

  it('should return 200 with empty array when no measurements exist', async () => {
    // remove all seed measurements
    const device = await env.DB.prepare('SELECT id FROM devices WHERE external_id = ?')
      .bind(TEST_DEVICE.externalId)
      .first<{ id: number }>()
    if (!device) throw new Error('TEST_DEVICE not found, seed device first')
    await env.DB.prepare('DELETE FROM measurements WHERE device_id = ?').bind(device.id).run()

    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId },
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBe(0)
  })

  it('should return 401 if authorization header is missing', async () => {
    const res = await client.measurements.$get({
      header: { Authorization: 'Bearer invalid-token' },
      query: { deviceId: TEST_DEVICE.externalId },
    })
    expect(res.status).toBe(401)
    const data = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(data.success).toBe(false)
  })

  it('should return 404 if deviceId is missing', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: {},
    })
    expect(res.status).toBe(404)
    const data = (await res.json()) as z.infer<typeof NotFoundErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error.message).toMatch(/Missing deviceId/i)
  })

  it('should return 404 if device does not exist', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: 'non-existent-device' },
    })
    expect(res.status).toBe(404)
    const data = (await res.json()) as z.infer<typeof NotFoundErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error.message).toMatch(/Device not found/i)
  })

  it('should return 422 when limit and offset are non-numeric strings', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId, limit: 'invalid', offset: 'invalid' },
    })
    expect(res.status).toBe(422)
    const data = (await res.json()) as z.infer<typeof ValidationErrorSchema>
    expect(data.success).toBe(false)
    expect(data.errors).toBeInstanceOf(Array)
    expect(data.errors.length).toBeGreaterThanOrEqual(2)
    const limitError = data.errors.find((e) => e.field === 'limit')
    const offsetError = data.errors.find((e) => e.field === 'offset')
    expect(limitError).toBeDefined()
    expect(limitError?.message).toBe('Must be a number')
    expect(offsetError).toBeDefined()
    expect(offsetError?.message).toBe('Must be a number')
  })

  it('should respect startAt and endAt filters', async () => {
    const seedStart = new Date(SEED_MEASUREMENTS[0].createdAt).getTime()
    const seedEnd = new Date(SEED_MEASUREMENTS[SEED_MEASUREMENTS.length - 1].createdAt).getTime()
    const queryStartAt = new Date(seedStart + 1 * 60 * 1000).toISOString() // 1 minute later
    const queryEndAt = new Date(seedEnd - 1 * 60 * 1000).toISOString() // 1 minute earlier

    const res = await client.measurements.$get({
      header: headerData,
      query: {
        deviceId: TEST_DEVICE.externalId,
        startAt: queryStartAt,
        endAt: queryEndAt,
      },
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>
    expect(data.success).toBe(true)
    // Verify that the returned data is within the range `startAt <= createdAt <= endAt`
    for (const m of data.data) {
      const created = new Date(m.createdAt)
      expect(created.getTime()).toBeGreaterThanOrEqual(seedStart)
      expect(created.getTime()).toBeLessThanOrEqual(seedEnd)
    }
  })

  it('should respect limit and offset', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId, limit: '2', offset: '1' },
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>
    expect(data.success).toBe(true)
    expect(data.data.length).toBeLessThanOrEqual(2)
    const expectedSecondMeasurement = SEED_MEASUREMENTS[1]
    expect(data.data[0].createdAt).toBe(expectedSecondMeasurement.createdAt)
  })

  it('should return measurements in default descending order when sort is not specified', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId },
    })
    expect(res.status).toBe(200)

    const data = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>
    expect(data.success).toBe(true)

    // Check descending order
    for (let i = 1; i < data.data.length; i++) {
      const prev = new Date(data.data[i - 1].createdAt).getTime()
      const curr = new Date(data.data[i].createdAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('should return measurements in descending order when sort=desc is specified', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId, sort: 'desc' },
    })
    expect(res.status).toBe(200)

    const data = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>
    expect(data.success).toBe(true)

    for (let i = 1; i < data.data.length; i++) {
      const prev = new Date(data.data[i - 1].createdAt).getTime()
      const curr = new Date(data.data[i].createdAt).getTime()
      expect(prev).toBeGreaterThanOrEqual(curr)
    }
  })

  it('should return measurements in ascending order when sort=asc is specified', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId, sort: 'asc' },
    })
    expect(res.status).toBe(200)

    const data = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>
    expect(data.success).toBe(true)

    for (let i = 1; i < data.data.length; i++) {
      const prev = new Date(data.data[i - 1].createdAt).getTime()
      const curr = new Date(data.data[i].createdAt).getTime()
      expect(prev).toBeLessThanOrEqual(curr)
    }
  })
})
