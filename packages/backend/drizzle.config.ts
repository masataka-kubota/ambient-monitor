import { defineConfig } from 'drizzle-kit'

const getEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: getEnv('CLOUDFLARE_ACCOUNT_ID'),
    databaseId: getEnv('CLOUDFLARE_DATABASE_ID'),
    token: getEnv('CLOUDFLARE_D1_TOKEN'),
  },
})
