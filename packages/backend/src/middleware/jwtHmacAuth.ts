import type { z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import type { Context, Next } from 'hono'
import { verify } from 'hono/jwt'

import { devices } from '@/db/schema'
import type { UnauthorizedErrorSchema } from '@/schemas'
import type { Env } from '@/types'

type JwtErrorResponse = z.infer<typeof UnauthorizedErrorSchema>

export const jwtHmacAuth = () => {
  return async (c: Context<Env>, next: Next) => {
    // Get token and deviceId from headers
    const token = c.req.header('Authorization')?.replace('Bearer ', '')
    const deviceId = c.req.header('X-Device-Id')

    if (!token || !deviceId) {
      const res: JwtErrorResponse = {
        success: false,
        error: { message: 'Missing token or deviceId' },
      }
      return c.json(res, 401)
    }

    // Retrieve the device record from the database using the deviceId
    const db = drizzle(c.env.DB)
    const device = await db.select().from(devices).where(eq(devices.deviceId, deviceId)).get()
    if (!device?.isActive) {
      const res: JwtErrorResponse = {
        success: false,
        error: { message: 'Unknown or inactive device' },
      }
      return c.json(res, 401)
    }

    const secret = device.secret

    // Verify the JWT using the device's secret, algorithm, expiration, and issuer
    try {
      await verify(token, secret, {
        alg: 'HS256', // Only allow HS256 algorithm
        exp: true, // Check expiration
        iss: deviceId, // Ensure issuer matches deviceId
      })
    } catch {
      const res: JwtErrorResponse = {
        success: false,
        error: { message: 'Invalid signature' },
      }
      return c.json(res, 401)
    }

    // If verification passes, proceed to the next handler
    return next()
  }
}
