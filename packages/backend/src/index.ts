import { OpenAPIHono } from '@hono/zod-openapi'
import { hc } from 'hono/client'

import { measurementsApp } from '@/routes'

const app = new OpenAPIHono()

  .notFound((c) => {
    return c.json({ success: false, message: 'Not Found' }, 404)
  })

  .route('/measurements', measurementsApp)

export default app

// this is a trick to calculate the type when compiling
export type Client = ReturnType<typeof hc<typeof app>>
export const hcWithType = (...args: Parameters<typeof hc>): Client => hc<typeof app>(...args)
