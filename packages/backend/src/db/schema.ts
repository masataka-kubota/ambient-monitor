import { sql } from 'drizzle-orm'
import { int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const measurements = sqliteTable('measurements', {
  id: int('id').primaryKey({ autoIncrement: true }),
  temperature: real('temperature').notNull(),
  humidity: real('humidity').notNull(),
  pressure: real('pressure').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
})
