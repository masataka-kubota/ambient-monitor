import { drizzle } from 'drizzle-orm/d1'
import type { Context, Next } from 'hono'

import type { Env } from '@/types'

export const withDb = async (c: Context<Env>, next: Next) => {
  c.set('db', drizzle(c.env.DB))
  await next()
}
