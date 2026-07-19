# Ambient Monitor (monorepo)

## Package manager

- Use **Bun** for installs and scripts: `bun install`, `bun run`, `bunx`.
- Do **not** use npm, yarn, or pnpm.
- Prefer filter syntax for package scripts, e.g. `bun run --filter mobile <script>`, `bun run --filter backend <script>`.
- Bun/Node versions are pinned in `.tool-versions`.

## Layout

- Bun workspaces under `packages/*`.
- `packages/mobile` — Expo / React Native app.
- `packages/backend` — Cloudflare Workers API.

Package-specific guidance lives in each package’s `AGENTS.md`. Do not duplicate those rules here.
