import { applyD1Migrations } from 'cloudflare:test'
import { env } from 'cloudflare:workers'

import { resetDatabase, seedAll } from '@/test/helpers'

// Apply migrations and set up test environment once per test file
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)

// Reset database and seed all data before each test case
beforeEach(async () => {
  await resetDatabase()
  await seedAll()
})
