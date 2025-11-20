import { applyD1Migrations, env } from 'cloudflare:test'
import { TEST_DEVICE, TEST_ENV } from 'test/constants'

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)

// Set test environment
env.EXPO_API_TOKEN = TEST_ENV.EXPO_API_TOKEN

// Seed required test data
// The tests rely on a specific device (TEST_DEVICE).
// Because multiple test files may run this seeding logic,
// we check for existence first to avoid UNIQUE constraint errors.
const existsTestDevice = await env.DB.prepare('SELECT 1 FROM devices WHERE device_id = ?')
  .bind(TEST_DEVICE.deviceId)
  .first()

if (!existsTestDevice) {
  await env.DB.prepare(`INSERT INTO devices (device_id, secret, is_active) VALUES (?, ?, ?)`)
    .bind(TEST_DEVICE.deviceId, TEST_DEVICE.secret, 1)
    .run()
}
