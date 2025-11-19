import { applyD1Migrations, env } from 'cloudflare:test'
import { TEST_DEVICE } from 'test/constants'

await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)

await env.DB.prepare(`INSERT INTO devices (device_id, secret, is_active) VALUES (?, ?, ?)`)
  .bind(TEST_DEVICE.deviceId, TEST_DEVICE.secret, 1)
  .run()
