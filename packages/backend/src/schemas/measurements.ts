import { createRoute, z } from '@hono/zod-openapi'
import { createInsertSchema } from 'drizzle-zod'

import { measurements } from '@/db/schema'
import { GenericSuccessSchema, ValidationErrorSchema } from '@/schemas/common'

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

export const createMeasurementRoute = createRoute({
  method: 'post',
  path: '/',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateMeasurementSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        'application/json': {
          schema: GenericSuccessSchema,
        },
      },
      description: 'Success',
    },
    400: {
      content: {
        'application/json': {
          schema: ValidationErrorSchema,
        },
      },
      description: 'Validation error',
    },
  },
})
