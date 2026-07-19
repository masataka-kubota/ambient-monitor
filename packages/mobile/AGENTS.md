# Mobile (`packages/mobile`)

## Expo

- Expo SDK **56**. Before writing code, read the versioned docs: https://docs.expo.dev/versions/v56.0.0/
- App config is `app.config.ts` (not `app.json`). Variants via `APP_VARIANT`: `development` | `preview` | `production`.
- Prefer Expo APIs and config plugins that match the installed SDK versions (`bunx expo install` when adding Expo packages).

## Tooling

- Lint/format: Oxlint / Oxfmt (`bun run lint`, `bun run format`).
- Types from the backend workspace package: `bun run build:backend-types` when API types change.
- EAS Build profiles / Update channels live in `eas.json` (`development` / `preview` / `production`).
- **CI labels** (on PRs into `main` / `staging`):
  - `eas-build-android` / `eas-build-ios` — EAS Build after merge (native binary).
  - `eas-update` — EAS Update (OTA) after merge; channel/environment are `production` on `main`, `preview` on `staging`.
  - Use Build for native / SDK / app version (`runtimeVersion`) changes; use Update for JS and asset-only changes.
  - Local/CI Update must pass `--platform ios` and/or `--platform android`. Omitting platform uses `all`, which also runs web static export and can fail (`window is not defined`) while this app is mobile-only.
