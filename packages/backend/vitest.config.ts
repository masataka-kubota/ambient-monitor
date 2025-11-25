import { defineWorkersConfig, readD1Migrations } from '@cloudflare/vitest-pool-workers/config'

import path from 'node:path'

export default defineWorkersConfig(async () => {
  const migrationsPath = path.join(__dirname, 'drizzle/migrations')
  const migrations = await readD1Migrations(migrationsPath)
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    test: {
      globals: true,
      setupFiles: ['./test/apply-migrations.ts'],
      poolOptions: {
        workers: {
          wrangler: { configPath: './wrangler.jsonc' },
          singleWorker: true,
          isolatedStorage: false,
          miniflare: {
            d1Databases: ['DB'],
            bindings: { TEST_MIGRATIONS: migrations },
          },
        },
      },
      coverage: {
        provider: 'istanbul' as const,
        exclude: [
          '**/node_modules/**',
          '**/.wrangler/**',
          '**/dist/**',
          '**/*.config**.ts',
          '**/drizzle/**',
          '**/migrations/**',
        ],
      },
    },
  }
})
