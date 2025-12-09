import type { z } from '@hono/zod-openapi'

import type { MeasurementListResponseSchema } from '@/schemas'

export type MeasurementListResponse = z.infer<typeof MeasurementListResponseSchema>
