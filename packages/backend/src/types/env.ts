import type { DrizzleD1Database } from 'drizzle-orm/d1'

export interface Env {
  Bindings: {
    DB: D1Database // defined in wrangler.jsonc
  }
  Variables: {
    db: DrizzleD1Database // set with hono middleware
  }
}
