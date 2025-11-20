import { createRoute, z } from '@hono/zod-openapi'
import { createInsertSchema } from 'drizzle-zod'

import { measurements } from '@/db/schema'
import { jwtHmacAuth, withDb } from '@/middleware'
import {
  SuccessResponseSchema,
  UnauthorizedErrorSchema,
  ValidationErrorSchema,
} from '@/schemas/common'

const baseSchema = createInsertSchema(measurements)

export const CreateMeasurementSchema = baseSchema
  .pick({
    temperature: true,
    humidity: true,
    pressure: true,
  })
  .extend({
    temperature: z.number().min(-100).max(100).openapi({ example: 25 }),
    humidity: z.number().min(0).max(100).openapi({ example: 50 }),
    pressure: z.number().min(0).openapi({ example: 1000 }),
  })

export const HeadersSchema = z.object({
  Authorization: z.string().openapi({ example: 'Bearer token' }),
  'X-Device-Id': z.string().openapi({ example: 'Device ID' }),
})

export const createMeasurementRoute = createRoute({
  method: 'post',
  path: '/',
  middleware: [withDb, jwtHmacAuth],
  request: {
    headers: HeadersSchema,
    body: {
      content: { 'application/json': { schema: CreateMeasurementSchema } },
    },
  },
  responses: {
    201: {
      content: { 'application/json': { schema: SuccessResponseSchema } },
      description: 'Success',
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedErrorSchema } },
      description: 'Unauthorized error',
    },
    422: {
      content: { 'application/json': { schema: ValidationErrorSchema } },
      description: 'Validation error',
    },
  },
})
