import type { z } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { testClient } from 'hono/testing'

import app from '@/index'
import type { ValidationErrorSchema } from '@/schemas/common'

describe('POST /measurements', () => {
  // Create the test client from the app instance
  const client = testClient(app, env)

  it('should create a measurement successfully', async () => {
    const res = await client.measurements.$post({
      json: {
        temperature: 20.55,
        humidity: 50.55,
        pressure: 1000.55,
      },
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toEqual({ success: true })
  })

  it('should return validation errors for invalid input', async () => {
    const invalidData = {
      temperature: 'invalid',
      humidity: 50.55,
      pressure: 1000.55,
    } as unknown as never
    const res = await client.measurements.$post({
      json: invalidData,
    })
    expect(res.status).toBe(400)
    const data = (await res.json()) as z.infer<typeof ValidationErrorSchema>
    expect(data.success).toBe(false)
    expect(data.errors).toBeInstanceOf(Array)
    expect(data.errors.length).toBeGreaterThan(0)
    expect(data.errors[0]).toHaveProperty('field')
    expect(data.errors[0]).toHaveProperty('message')
  })
})
