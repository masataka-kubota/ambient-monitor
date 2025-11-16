import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

import { measurements } from '@/db/schema'

const baseSchema = createInsertSchema(measurements)

export const createMeasurementsSchema = baseSchema
  .pick({
    temperature: true,
    humidity: true,
    pressure: true,
  })
  .extend({
    temperature: z.number().min(-100).max(100),
    humidity: z.number().min(0).max(100),
    pressure: z.number().min(0),
  })
