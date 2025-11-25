import type { RouteConfig, RouteHook, z } from '@hono/zod-openapi'
import type { Env } from 'hono'

import type { ValidationErrorSchema } from '@/schemas'

export const createValidationHook = <R extends RouteConfig, E extends Env>(): RouteHook<R, E> => {
  return (result, c) => {
    if (!result.success) {
      const res: z.infer<typeof ValidationErrorSchema> = {
        success: false,
        errors: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      }

      return c.json(res, 422)
    }
  }
}
