import { env } from 'cloudflare:test'
import { SEED_MEASUREMENTS, TEST_DEVICE } from 'test/constants'

/**
 * Completely reset database tables for tests.
 */
export const resetDatabase = async () => {
  const db = env.DB
  await db.prepare(`DELETE FROM measurements`).run()
  await db.prepare(`DELETE FROM devices`).run()
}

/**
 * Insert the test device defined in constants.
 */
export const insertSeedDevice = async () => {
  const db = env.DB
  const exists = await db
    .prepare('SELECT 1 FROM devices WHERE external_id = ?')
    .bind(TEST_DEVICE.externalId)
    .first()

  if (!exists) {
    await db
      .prepare(`INSERT INTO devices (external_id, secret, is_active) VALUES (?, ?, ?)`)
      .bind(TEST_DEVICE.externalId, TEST_DEVICE.secret, 1)
      .run()
  }
}

// Generate timestamp "YYYY-MM-DD HH:mm:ss"
const toSqlDateTime = (date: Date) => {
  return date
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d+Z$/, '')
}
/**
 * Insert seed measurements for the test device.
 */
export const insertSeedMeasurements = async () => {
  const db = env.DB
  const device = await db
    .prepare('SELECT id FROM devices WHERE external_id = ?')
    .bind(TEST_DEVICE.externalId)
    .first<{ id: number }>()

  if (!device) throw new Error('TEST_DEVICE not found — call insertSeedDevice first')

  const now = new Date()
  for (const m of SEED_MEASUREMENTS) {
    const createdAtDate = new Date(now.getTime() - m.minutesAgo * 60 * 1000)

    // Round off seconds, to make stable tests
    createdAtDate.setSeconds(0)
    createdAtDate.setMilliseconds(0)

    const createdAt = toSqlDateTime(createdAtDate)

    await db
      .prepare(
        `INSERT INTO measurements 
          (device_id, temperature, humidity, pressure, created_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(device.id, m.temperature, m.humidity, m.pressure, createdAt)
      .run()
  }
}

/**
 * Seed everything (device + measurements)
 */
export const seedAll = async () => {
  await insertSeedDevice()
  await insertSeedMeasurements()
}
