import { zValidator } from '@hono/zod-validator'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'

import { measurements } from '@/db/schema'
import type { D1Env } from '@/types'
import { createMeasurementsSchema } from '@/validations'

const measurementsApp = new Hono<D1Env>()
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
