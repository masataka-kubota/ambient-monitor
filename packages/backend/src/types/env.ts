import type { DrizzleD1Database } from 'drizzle-orm/d1'

export interface Env {
  Bindings: {
    DB: D1Database // defined in wrangler.jsonc
    EXPO_API_TOKEN: string // defined in .env or Worker environment
  }
  Variables: {
    db: DrizzleD1Database // set with hono middleware
  }
}
