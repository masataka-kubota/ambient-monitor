import { hc } from 'hono/client'

import type app from '@/index'

// Compile-time trick: Client is fully resolved in .d.ts; runtime JS only needs hono/client.
export type Client = ReturnType<typeof hc<typeof app>>
export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<typeof app>(...args)

export type { MeasurementListResponse } from '@/client'
