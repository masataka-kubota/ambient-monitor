import type { z } from '@hono/zod-openapi'
import { env } from 'cloudflare:test'
import { sign } from 'hono/jwt'
import { testClient } from 'hono/testing'
import { TEST_DEVICE } from 'test/constants'

import app from '@/index'
import type { MeasurementCreateHeadersSchema, ValidationErrorSchema } from '@/schemas'

describe('POST /measurements', () => {
  // Create the test client from the app instance
  const client = testClient(app, env)

  let headerData: z.infer<typeof MeasurementCreateHeadersSchema>
  const jsonData = { temperature: 20.55, humidity: 50.55, pressure: 1000.55 }

  beforeEach(async () => {
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

  it('should create a measurement successfully', async () => {
    const res = await client.measurements.$post({
      header: headerData,
      json: jsonData,
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toEqual({ success: true })
  })

  it('should return validation errors for invalid input', async () => {
    const invalidData = {
      ...jsonData,
      temperature: 'invalid',
    } as unknown as never
    const res = await client.measurements.$post({
      header: headerData,
      json: invalidData,
    })
    expect(res.status).toBe(422)
    const data = (await res.json()) as z.infer<typeof ValidationErrorSchema>
    expect(data.success).toBe(false)
    expect(data.errors).toBeInstanceOf(Array)
    expect(data.errors.length).toBeGreaterThan(0)
    expect(data.errors[0]).toHaveProperty('field')
    expect(data.errors[0]).toHaveProperty('message')
  })
})
