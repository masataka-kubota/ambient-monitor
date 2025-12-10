import { sql } from 'drizzle-orm'
import { index, int, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const measurements = sqliteTable(
  'measurements',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    deviceId: int('device_id')
      .notNull()
      .references(() => devices.id, { onDelete: 'cascade' }),
    temperature: real('temperature').notNull(),
    humidity: real('humidity').notNull(),
    pressure: real('pressure').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_measurements_device_id').on(table.deviceId),
    index('idx_measurements_created_at').on(table.createdAt),
  ]
)

export const devices = sqliteTable(
  'devices',
  {
    id: int('id').primaryKey({ autoIncrement: true }),
    externalId: text('external_id').notNull().unique(),
    secret: text('secret').notNull(),
    name: text('name'),
    isActive: int('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('idx_devices_external_id').on(table.externalId)]
)
