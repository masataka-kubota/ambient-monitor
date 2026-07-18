# Mobile (`packages/mobile`)

## Expo

- Expo SDK **56**. Before writing code, read the versioned docs: https://docs.expo.dev/versions/v56.0.0/
- App config is `app.config.ts` (not `app.json`). Variants via `APP_VARIANT`: `development` | `preview` | `production`.
- Prefer Expo APIs and config plugins that match the installed SDK versions (`bunx expo install` when adding Expo packages).

## Tooling

- Lint/format: Oxlint / Oxfmt (`bun run lint`, `bun run format`).
- Types from the backend workspace package: `bun run build:backend-types` when API types change.
- EAS Build profiles live in `eas.json`. Native changes require a new binary build.
