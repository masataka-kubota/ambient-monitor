import type { DrizzleD1Database } from 'drizzle-orm/d1'

export interface D1Env {
  Bindings: {
    DB: D1Database
  }
  Variables: {
    db: DrizzleD1Database
  }
}
