import type { DrizzleD1Database } from 'drizzle-orm/d1'

import type { DatabaseSchema } from '@/db/schema'

/**
 * Schema-typed Drizzle client for Cloudflare D1.
 *
 * Distinct from the raw Workers binding `D1Database` (`Env.Bindings.DB`).
 * Created in `withDb` via `drizzle(c.env.DB, { schema })` and stored as `c.var.db`.
 */
export type AppDatabase = DrizzleD1Database<DatabaseSchema>

export interface Env {
  Bindings: {
    /** Raw Cloudflare D1 binding from wrangler.jsonc. */
    DB: D1Database
  }
  Variables: {
    /** Schema-typed Drizzle client set by the `withDb` middleware. */
    db: AppDatabase
  }
}
