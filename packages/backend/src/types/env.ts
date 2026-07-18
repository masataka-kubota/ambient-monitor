import type { DrizzleD1Database } from 'drizzle-orm/d1'

import type * as schema from '@/db/schema'

export interface Env {
  Bindings: {
    DB: D1Database // defined in wrangler.jsonc
  }
  Variables: {
    db: DrizzleD1Database<typeof schema> // set with hono middleware
  }
}
