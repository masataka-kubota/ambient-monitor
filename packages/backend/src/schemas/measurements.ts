import { createRoute, z } from '@hono/zod-openapi'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { measurements } from '@/db/schema'
import { jwtHmacAuth, verifyExpoToken, withDb } from '@/middleware'
import {
  BearerAuthHeaderSchema,
  NotFoundErrorSchema,
  SuccessResponseSchema,
  SuccessWithDataArraySchema,
  UnauthorizedErrorSchema,
  ValidationErrorSchema,
} from '@/schemas/common'

/* --- Base Schema --- */
// POST, PUT, PATCH, DELETE
const insertSchema = createInsertSchema(measurements, {
  deviceId: z.number().openapi({ example: 1 }),
  temperature: z.number().min(-100).max(100).openapi({ example: 25 }),
  humidity: z.number().min(0).max(100).openapi({ example: 50 }),
  pressure: z.number().min(0).openapi({ example: 1000 }),
})
// GET
const selectSchema = createSelectSchema(measurements, {
  id: z.number().openapi({ example: 1 }),
  createdAt: z.string().openapi({ example: '2025-11-19 10:00:00' }),
})

/* --- POST /measurements --- */
export const MeasurementCreateRequestSchema = insertSchema.pick({
  temperature: true,
  humidity: true,
  pressure: true,
})

export const MeasurementCreateHeadersSchema = BearerAuthHeaderSchema.extend({
  'X-Device-Id': z.string().openapi({ example: 'Device ID' }),
})

export const createMeasurementRoute = createRoute({
  method: 'post',
  path: '/',
  middleware: [withDb, jwtHmacAuth],
  request: {
    headers: MeasurementCreateHeadersSchema,
    body: {
      content: { 'application/json': { schema: MeasurementCreateRequestSchema } },
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

/* --- GET /measurements --- */
export const MeasurementListResponseSchema = SuccessWithDataArraySchema(selectSchema)

export const MeasurementListQuerySchema = z.object({
  deviceId: z.string().optional().openapi({ example: 'device-id' }),
  startAt: z.string().optional().openapi({ example: '2025-11-19 10:00:00' }),
  endAt: z.string().optional().openapi({ example: '2025-11-19 10:00:00' }),
  limit: z.string().regex(/^\d+$/, 'Must be a number').optional().openapi({ example: '10' }),
  offset: z.string().regex(/^\d+$/, 'Must be a number').optional().openapi({ example: '0' }),
})

export const listMeasurementsRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [withDb, verifyExpoToken],
  request: {
    headers: BearerAuthHeaderSchema,
    query: MeasurementListQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: MeasurementListResponseSchema } },
      description: 'List of measurements',
    },
    401: {
      content: { 'application/json': { schema: UnauthorizedErrorSchema } },
      description: 'Unauthorized',
    },
    404: {
      content: { 'application/json': { schema: NotFoundErrorSchema } },
      description: 'Not found',
    },
    422: {
      content: { 'application/json': { schema: ValidationErrorSchema } },
      description: 'Validation error',
    },
  },
})
