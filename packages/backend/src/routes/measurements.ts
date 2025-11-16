import { zValidator } from '@hono/zod-validator'
import type { DrizzleD1Database } from 'drizzle-orm/d1'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'

import { measurements } from '@/db/schema'
import { createMeasurementsSchema } from '@/validations'

interface Env {
  Bindings: {
    DB: D1Database
  }
  Variables: {
    db: DrizzleD1Database
  }
}

const measurementsApp = new Hono<Env>()
  .use(async (c, next) => {
    c.set('db', drizzle(c.env.DB))
    await next()
  })
  .post(
    '/',
    zValidator('json', createMeasurementsSchema, (result, c) => {
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }))
        return c.json({ success: false, errors }, 400)
      }
    }),
    async (c) => {
      const db = c.var.db
      const { temperature, humidity, pressure } = c.req.valid('json')

      await db.insert(measurements).values({ temperature, humidity, pressure }).returning()
      return c.json({ success: true }, 201)
    }
  )

export default measurementsApp
