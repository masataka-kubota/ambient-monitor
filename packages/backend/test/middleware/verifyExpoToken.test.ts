import type { z } from '@hono/zod-openapi'
import { createRoute, OpenAPIHono } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { testClient } from 'hono/testing'
import { TEST_ENV } from 'test/constants'
import { describe, it, expect } from 'vitest'

import { verifyExpoToken } from '@/middleware'
import { UnauthorizedErrorSchema, BearerAuthHeaderSchema, SuccessResponseSchema } from '@/schemas'
import type { Env } from '@/types'

describe('verifyExpoToken middleware', () => {
  let nextCalled: boolean

  beforeEach(() => {
    nextCalled = false
  })

  const route = createRoute({
    method: 'get',
    path: '/test',
    middleware: [verifyExpoToken],
    request: {
      headers: BearerAuthHeaderSchema,
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

  const app = new OpenAPIHono<Env>().openapi(route, (c) => {
    nextCalled = true
    return c.json({ success: true }, 200)
  })

  const client = testClient(app, env)

  it('returns 200 for valid token', async () => {
    const res = await client.test.$get({
      header: { Authorization: `Bearer ${TEST_ENV.EXPO_API_TOKEN}` },
    })
    expect(res.status).toBe(200)
    expect(nextCalled).toBe(true)
  })

  it('returns 401 for invalid token', async () => {
    const res = await client.test.$get({
      header: { Authorization: 'Bearer invalid-token' },
    })
    expect(res.status).toBe(401)
    expect(nextCalled).toBe(false)
    const data = (await res.json()) as z.infer<typeof UnauthorizedErrorSchema>
    expect(data.success).toBe(false)
    expect(data.error).toEqual({ message: 'Unauthorized error' })
  })
})
