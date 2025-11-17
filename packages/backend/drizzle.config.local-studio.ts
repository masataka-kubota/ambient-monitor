import { defineConfig } from 'drizzle-kit'

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'

// Find the path to the local D1 database
function findD1Database(): string {
  try {
    const command =
      "find .wrangler/state/v3/d1/miniflare-D1DatabaseObject -type f -name '*.sqlite' -print -quit"
    const dbPath = execSync(command, { encoding: 'utf-8' }).trim()

    if (!dbPath || !existsSync(dbPath)) {
      throw new Error('D1 local database file not found')
    }

    console.log(`Found D1 database at: ${dbPath}`)
    return dbPath
  } catch (error) {
    console.error('Failed to find D1 database:', error)
    throw error
  }
}

export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: findD1Database(),
  },
})
