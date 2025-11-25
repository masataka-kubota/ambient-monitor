import type { z } from '@hono/zod-openapi'
import type { Context, Next } from 'hono'
import { bearerAuth } from 'hono/bearer-auth'

import type { UnauthorizedErrorSchema } from '@/schemas'
import type { Env } from '@/types'

type UnauthorizedError = z.infer<typeof UnauthorizedErrorSchema>

export const verifyExpoToken = async (c: Context<Env, string>, next: Next) => {
  const middleware = bearerAuth({
    verifyToken: (token: string, c: Context<Env>) => token === c.env.EXPO_API_TOKEN,
  })
  try {
    await middleware(c, next)
  } catch {
    const res: UnauthorizedError = { success: false, error: { message: 'Unauthorized error' } }

    return c.json(res, 401)
  }
}
