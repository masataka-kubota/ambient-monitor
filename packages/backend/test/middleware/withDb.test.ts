import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { eq } from 'drizzle-orm'
import { testClient } from 'hono/testing'
import { TEST_DEVICE } from 'test/constants'
import { describe, it, expect } from 'vitest'

import { devices } from '@/db/schema'
import { withDb } from '@/middleware/'
import { InternalServerErrorSchema, SuccessResponseSchema } from '@/schemas'
import type { Env } from '@/types'

describe('withDb middleware', () => {
  let nextCalled: boolean

  beforeEach(() => {
    nextCalled = false
  })

  const DeviceQuerySchema = z.object({
    deviceId: z.string().openapi({ example: 'device-id-123' }),
  })

  // with middleware route
  const validRoute = createRoute({
    method: 'get',
    path: '/test',
    middleware: [withDb],
    request: {
      query: DeviceQuerySchema,
    },
    responses: {
      200: {
        content: { 'application/json': { schema: SuccessResponseSchema } },
        description: 'Success',
      },
      500: {
        content: { 'application/json': { schema: InternalServerErrorSchema } },
        description: 'Unauthorized error',
      },
    },
  })

  // without middleware route
  const invalidRoute = createRoute({
    method: 'get',
    path: '/invalid-test',
    request: {
      query: DeviceQuerySchema,
    },
    responses: {
      200: {
        content: { 'application/json': { schema: SuccessResponseSchema } },
        description: 'Success',
      },
      500: {
        content: { 'application/json': { schema: InternalServerErrorSchema } },
        description: 'Unauthorized error',
      },
    },
  })

  const app = new OpenAPIHono<Env>()
    .openapi(validRoute, async (c) => {
      try {
        const { deviceId } = c.req.valid('query')
        const db = c.var.db
        await db.select().from(devices).where(eq(devices.deviceId, deviceId)).get()
        nextCalled = true
        return c.json({ success: true }, 200)
      } catch {
        return c.json({ success: false, error: { message: 'could not connect to database' } }, 500)
      }
    })
    .openapi(invalidRoute, async (c) => {
      try {
        const { deviceId } = c.req.valid('query')
        const db = c.var.db
        await db.select().from(devices).where(eq(devices.deviceId, deviceId)).get()
        nextCalled = true
        return c.json({ success: true }, 200)
      } catch {
        return c.json({ success: false, error: { message: 'could not connect to database' } }, 500)
      }
    })

  const client = testClient(app, env)

  it('validRoute should returns 200 when DB is set with middleware', async () => {
    const res = await client.test.$get({ query: { deviceId: TEST_DEVICE.deviceId } })
    expect(res.status).toBe(200)
    expect(nextCalled).toBe(true)
  })

  it('invalidRoute should returns 500 when DB is not set with middleware', async () => {
    const res = await client['invalid-test'].$get({ query: { deviceId: TEST_DEVICE.deviceId } })
    expect(res.status).toBe(500)
    expect(nextCalled).toBe(false)
  })
})
