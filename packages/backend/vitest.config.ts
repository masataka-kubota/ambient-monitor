import { cloudflareTest, readD1Migrations } from '@cloudflare/vitest-pool-workers'
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig(async () => {
  const migrationsPath = path.join(__dirname, 'drizzle/migrations')
  const migrations = await readD1Migrations(migrationsPath)
  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: './wrangler.jsonc' },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    resolve: {
      alias: {
        '@/test': path.resolve(__dirname, 'test'),
        '@': path.resolve(__dirname, 'src'),
      },
    },
    test: {
      globals: true,
      setupFiles: ['./test/apply-migrations.ts'],
      coverage: {
        provider: 'istanbul' as const,
        exclude: [
          '**/node_modules/**',
          '**/.wrangler/**',
          '**/dist/**',
          '**/*.config**.ts',
          '**/drizzle/**',
          '**/migrations/**',
          '**/src/db/schema.ts',
          '**/test/**',
        ],
      },
    },
  }
})
