# Backend (`packages/backend`)

## Stack

- Cloudflare Workers + Wrangler (`wrangler.jsonc`).
- HTTP: Hono (`@hono/zod-openapi` where applicable).
- DB: Drizzle ORM on Cloudflare D1.
- After changing Worker bindings/config, run `bun run cf-typegen` and use `CloudflareBindings` on Hono.

## Tooling

- Lint/format: Oxlint / Oxfmt (`bun run lint`, `bun run format`).
- Tests: Vitest (`bun run test`). Prefer Workers-compatible patterns already used in this package.
- Migrations: `bun run db:generate`, then `db:migration:local` / `db:migration:remote` as appropriate.
- Prefer current Cloudflare docs over outdated Workers patterns (see project Cloudflare-related skills when available).
