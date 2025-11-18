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

export const devices = sqliteTable('devices', {
  id: int('id').primaryKey({ autoIncrement: true }),
  deviceId: text('device_id').notNull(),
  secret: text('secret').notNull(),
  name: text('name'),
  isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
})
