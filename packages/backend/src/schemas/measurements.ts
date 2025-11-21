import { createRoute, z } from '@hono/zod-openapi'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { measurements } from '@/db/schema'
import { jwtHmacAuth, verifyExpoToken, withDb } from '@/middleware'
import {
  BearerAuthHeaderSchema,
  SuccessResponseSchema,
  SuccessWithDataSchema,
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
  createdAt: z.string().openapi({ example: '2025-11-19T10:00:00Z' }),
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
export const MeasurementListResponseSchema = SuccessWithDataSchema(selectSchema)

export const MeasurementListQuerySchema = z.object({
  deviceId: z.string().optional().openapi({ example: 'device-id' }),
  startAt: z.string().optional().openapi({ example: '2025-11-19T10:00:00Z' }),
  endAt: z.string().optional().openapi({ example: '2025-11-19T10:00:00Z' }),
  limit: z.number().min(1).max(100).optional().openapi({ example: 10 }),
  offset: z.number().min(0).optional().openapi({ example: 0 }),
})

export const listMeasurementsRoute = createRoute({
  method: 'get',
  path: '/',
  middleware: [verifyExpoToken],
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
  },
})
