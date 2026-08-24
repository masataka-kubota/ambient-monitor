import { OpenAPIHono } from '@hono/zod-openapi'

import { measurementsApp } from '@/routes'

const app = new OpenAPIHono()

  .notFound((c) => {
    return c.json({ success: false, message: 'Not Found' }, 404)
  })

  .route('/measurements', measurementsApp)

export default app

/** Hono app type for RPC clients (e.g. `hc<AppType>` or package `hcWithType`). */
export type AppType = typeof app
