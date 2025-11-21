import { applyD1Migrations, env } from 'cloudflare:test'
import { resetDatabase, seedAll, setupTestEnv } from 'test/helpers'

// Apply migrations and set up test environment once per test file
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
setupTestEnv()

// Reset database and seed all data before each test case
beforeEach(async () => {
  await resetDatabase()
  await seedAll()
})
