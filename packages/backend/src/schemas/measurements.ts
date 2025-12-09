import { createRoute, z } from '@hono/zod-openapi'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

import { measurements } from '@/db/schema'
import { jwtHmacAuth, verifyExpoToken, withDb } from '@/middleware'
import {
  BearerAuthHeaderSchema,
  NotFoundErrorSchema,
  SuccessResponseSchema,
  SuccessWithDataArraySchema,
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
// GET (for live)
const selectLatestSchema = createSelectSchema(measurements, {
  id: z.number().openapi({ example: 1 }),
  createdAt: z.string().openapi({ example: '2025-11-19 10:00:00' }),
})
// GET (for Aggregate)
const selectListSchema = z.object({
  bucketStart: z.string().openapi({ example: '2025-12-08 22:00:00' }),
  temperature: z.number().nullable().openapi({ example: 25 }),
  humidity: z.number().nullable().openapi({ example: 50 }),
  pressure: z.number().nullable().openapi({ example: 1000 }),
})

/* --- POST /measurements --- */
export const MeasurementCreateRequestSchema = insertSchema.pick({
  temperature: true,
  humidity: true,
  pressure: true,
})

export const MeasurementCreateHeadersSchema = BearerAuthHeaderSchema.extend({
  'X-Device-Id': z.string().openapi({ example: 'Device external ID' }),
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
export const MeasurementListResponseSchema = SuccessWithDataArraySchema(selectListSchema)

export const MeasurementListQuerySchema = z.object({
  deviceId: z.string().optional().openapi({ example: 'device-id' }),
  period: z.enum(['1d', '7d', '30d']).default('1d'),
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

/* --- GET /measurements/latest --- */
export const MeasurementLatestResponseSchema = SuccessWithDataSchema(selectLatestSchema)

export const MeasurementLatestQuerySchema = z.object({
  deviceId: z.string().optional().openapi({ example: 'device-id' }),
})

export const latestMeasurementRoute = createRoute({
  method: 'get',
  path: '/latest',
  middleware: [withDb, verifyExpoToken],
  request: {
    headers: BearerAuthHeaderSchema,
    query: MeasurementLatestQuerySchema,
  },
  responses: {
    200: {
      content: { 'application/json': { schema: MeasurementLatestResponseSchema } },
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
  },
})
