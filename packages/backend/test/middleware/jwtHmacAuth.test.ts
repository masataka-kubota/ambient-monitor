import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import type { z } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { sign } from 'hono/jwt'
import { testClient } from 'hono/testing'
import { TEST_DEVICE } from 'test/constants'
import { describe, it, expect } from 'vitest'

import { jwtHmacAuth } from '@/middleware/jwtHmacAuth'
import { HeadersSchema, SuccessResponseSchema, UnauthorizedErrorSchema } from '@/schemas'
import type { D1Env } from '@/types'

describe('jwtHmacAuth middleware', () => {
  let nextCalled: boolean
  let headerData: z.infer<typeof HeadersSchema>

  beforeEach(async () => {
    nextCalled = false

    const timestamp = Math.floor(Date.now() / 1000)
    const token = await sign(
      {
        iss: TEST_DEVICE.deviceId,
        iat: timestamp,
        exp: timestamp + 30,
      },
      TEST_DEVICE.secret,
      'HS256'
    )
    headerData = {
      Authorization: `Bearer ${token}`,
      'X-Device-Id': TEST_DEVICE.deviceId,
    }
  })

  const route = createRoute({
    method: 'get',
    path: '/test',
    middleware: [jwtHmacAuth()],
    request: {
      headers: HeadersSchema,
    },
    responses: {
      200: {
        content: { 'application/json': { schema: SuccessResponseSchema } },
        description: 'Success',
      },
      401: {
        content: { 'application/json': { schema: UnauthorizedErrorSchema } },
        description: 'Unauthorized error',
      },
    },
  })

  const app = new OpenAPIHono<D1Env>().openapi(route, (c) => {
    nextCalled = true
    return c.json({ success: true }, 200)
  })

  // Create the test client from the app instance
  const client = testClient(app, env)

  it('should call next if token and device are valid', async () => {
    const res = await client.test.$get({ header: headerData })
    expect(res.status).toBe(200)
    expect(nextCalled).toBe(true)
    const data = await res.json()
    expect(data).toEqual({ success: true })
  })

  it('should return 401 if token is missing', async () => {
    const invalidHeaderData = { ...headerData, Authorization: '' }
    const res = await client.test.$get({ header: invalidHeaderData })
    expect(res.status).toBe(401)
    expect(nextCalled).toBe(false)
    const data = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error).toEqual({ message: 'Missing token or deviceId' })
  })

  it('should return 401 if device is missing', async () => {
    const invalidHeaderData = { ...headerData, 'X-Device-Id': '' }
    const res = await client.test.$get({ header: invalidHeaderData })
    expect(res.status).toBe(401)
    expect(nextCalled).toBe(false)
    const data = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error).toEqual({ message: 'Missing token or deviceId' })
  })

  it('should return 401 if device is unknown', async () => {
    const invalidHeaderData = { ...headerData, 'X-Device-Id': 'unknown-device' }
    const res = await client.test.$get({ header: invalidHeaderData })
    expect(res.status).toBe(401)
    expect(nextCalled).toBe(false)
    const data = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error).toEqual({ message: 'Unknown or inactive device' })
  })

  it('should return 401 if device is inactive', async () => {
    // Set the device to inactive temporarily
    await env.DB.prepare(`UPDATE devices SET is_active = 0 WHERE device_id = ?`)
      .bind(TEST_DEVICE.deviceId)
      .run()

    const res = await client.test.$get({ header: headerData })
    expect(res.status).toBe(401)
    expect(nextCalled).toBe(false)

    const data = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error).toEqual({ message: 'Unknown or inactive device' })

    // Restore the device to active after the test
    await env.DB.prepare(`UPDATE devices SET is_active = 1 WHERE device_id = ?`)
      .bind(TEST_DEVICE.deviceId)
      .run()
  })

  it('should return 401 if token is invalid', async () => {
    const invalidHeaderData = { ...headerData, Authorization: 'invalid-token' }
    const res = await client.test.$get({ header: invalidHeaderData })
    expect(res.status).toBe(401)
    expect(nextCalled).toBe(false)
    const data = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error).toEqual({ message: 'Invalid signature' })
  })
})
