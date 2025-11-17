import type { RouteConfig, RouteHook } from '@hono/zod-openapi'
import type { Env } from 'hono'

export const createValidationHook = <R extends RouteConfig, E extends Env>(): RouteHook<R, E> => {
  return (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          errors: result.error.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        400
      )
    }
  }
}
