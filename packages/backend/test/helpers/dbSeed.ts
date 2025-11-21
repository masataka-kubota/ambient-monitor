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
    .prepare('SELECT 1 FROM devices WHERE device_id = ?')
    .bind(TEST_DEVICE.deviceId)
    .first()

  if (!exists) {
    await db
      .prepare(`INSERT INTO devices (device_id, secret, is_active) VALUES (?, ?, ?)`)
      .bind(TEST_DEVICE.deviceId, TEST_DEVICE.secret, 1)
      .run()
  }
}

/**
 * Insert seed measurements for the test device.
 */
export const insertSeedMeasurements = async () => {
  const db = env.DB
  const device = await db
    .prepare('SELECT id FROM devices WHERE device_id = ?')
    .bind(TEST_DEVICE.deviceId)
    .first<{ id: number }>()

  if (!device) throw new Error('TEST_DEVICE not found — call insertSeedDevice first')

  for (const m of SEED_MEASUREMENTS) {
    const exists = await db
      .prepare('SELECT 1 FROM measurements WHERE device_id = ? AND created_at = ?')
      .bind(device.id, m.createdAt)
      .first()

    if (!exists) {
      await db
        .prepare(
          `INSERT INTO measurements 
            (device_id, temperature, humidity, pressure, created_at)
           VALUES (?, ?, ?, ?, ?)`
        )
        .bind(device.id, m.temperature, m.humidity, m.pressure, m.createdAt)
        .run()
    }
  }
}

/**
 * Seed everything (device + measurements)
 */
export const seedAll = async () => {
  await insertSeedDevice()
  await insertSeedMeasurements()
}
