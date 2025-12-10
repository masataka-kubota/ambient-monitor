import type { z } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { testClient } from 'hono/testing'
import { TEST_DEVICE, TEST_ENV } from 'test/constants'

import { PERIOD_INTERVAL_MINUTES } from '@/constants'
import app from '@/index'
import type {
  MeasurementListResponseSchema,
  NotFoundErrorSchema,
  UnauthorizedErrorSchema,
  ValidationErrorSchema,
} from '@/schemas'

describe('GET /measurements', () => {
  const client = testClient(app, env)
  const headerData = { Authorization: `Bearer ${TEST_ENV.EXPO_API_TOKEN}` }

  // -------------------------
  // 1day test
  // -------------------------
  it('1d: should return correct aggregated measurements', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId, period: '1d' },
    })

    expect(res.status).toBe(200)
    const json = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    const intervalMin = PERIOD_INTERVAL_MINUTES['1d']
    const expectedBuckets = Math.floor((1 * 24 * 60) / intervalMin) + 1
    expect(json.data.length).toBe(expectedBuckets)

    const nonNullCount = json.data.filter((r) => r.temperature !== null).length
    expect(nonNullCount).toBeGreaterThan(0)
  })

  // -------------------------
  // 7day test
  // -------------------------
  it('7d: should return correct aggregated measurements', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId, period: '7d' },
    })

    expect(res.status).toBe(200)
    const json = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    const intervalMin = PERIOD_INTERVAL_MINUTES['7d']
    const expectedBuckets = Math.floor((7 * 24 * 60) / intervalMin) + 1
    expect(json.data.length).toBe(expectedBuckets)

    const nonNullCount = json.data.filter((r) => r.temperature !== null).length
    expect(nonNullCount).toBeGreaterThan(0)
  })

  // -------------------------
  // 30day test
  // -------------------------
  it('30d: should return correct aggregated measurements', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: TEST_DEVICE.externalId, period: '30d' },
    })

    expect(res.status).toBe(200)
    const json = (await res.json()) as z.infer<typeof MeasurementListResponseSchema>

    expect(json.success).toBe(true)
    expect(Array.isArray(json.data)).toBe(true)

    const intervalMin = PERIOD_INTERVAL_MINUTES['30d']
    const expectedBuckets = Math.floor((30 * 24 * 60) / intervalMin) + 1
    expect(json.data.length).toBe(expectedBuckets)

    const nonNullCount = json.data.filter((r) => r.temperature !== null).length
    expect(nonNullCount).toBeGreaterThan(0)
  })

  // -------------------------
  // 401 tests
  // -------------------------
  it('should return 401 if authorization header is missing', async () => {
    const res = await client.measurements.$get({
      header: { Authorization: 'Bearer invalid-token' },
      query: { deviceId: TEST_DEVICE.externalId, period: '1d' },
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
    const res = await client.measurements.$get({
      header: headerData,
      query: { period: '1d' },
    })
    expect(res.status).toBe(404)
    const json = (await res.json()) as z.infer<typeof NotFoundErrorSchema>
    expect(json.success).toBe(false)
    expect(json.error.message).toMatch(/Missing deviceId/i)
  })

  it('should return 404 if device does not exist', async () => {
    const res = await client.measurements.$get({
      header: headerData,
      query: { deviceId: 'unknown', period: '1d' },
    })
    expect(res.status).toBe(404)
    const json = (await res.json()) as z.infer<typeof NotFoundErrorSchema>
    expect(json.success).toBe(false)
    expect(json.error.message).toMatch(/Device not found/i)
  })

  // -------------------------
  // 422 tests
  // -------------------------
  it('should return 422 if period is invalid', async () => {
    const query: unknown = { deviceId: TEST_DEVICE.externalId, period: 'invalid' }

    const res = await client.measurements.$get({
      header: headerData,
      query: query as Record<string, unknown>,
    })
    expect(res.status).toBe(422)
    const json = (await res.json()) as z.infer<typeof ValidationErrorSchema>
    expect(json.success).toBe(false)
  })
})
