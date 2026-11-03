# FlashReel  Website


## Repositories

| Component | Repository |
|-----------|------------|
| 🖥 Backend | https://github.com/phongkhongxai/flashreel-be |
| 🖥 Backend Nestjs | https://github.com/phongkhongxai/flashreel-be-ts |
| 🌐 Frontend | https://github.com/phongkhongxai/flashreel-fe |
| 📱 Android app | https://github.com/phongkhongxai/flashreel-android |

## Internationalization

The admin UI uses `react-i18next` with translations in `src/locales/`.

- `en.json` for English
- `vi.json` for Vietnamese
- `zh.json` for Chinese fallback/compatibility

The header language switcher persists the selected language in `localStorage` under `flashreel-admin-lang`.

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred.
Edit `.env` before starting the dev server. Restart Vite after changing it.
For a production build, configure the appropriate values before running `npm run build`.

Build:

```bash
npm run build
```

## Authentication

- Consumer login: `/login`; admin login: `/admin/login`; admin dashboard: `/admin`.
- Access and refresh tokens are stored in browser storage and rotated together. Logout clears the local session.

## API Client

Typed API modules live in `src/services/`.

- Configuration is read by `src/config/env.ts` from Vite environment variables:
  - `VITE_API_BASE_URL`: backend base URL, for example `http://localhost:8080` or the deployed backend URL. The API client and relative media URLs both use this value.
  - `VITE_GOOGLE_CLIENT_ID`: public Google OAuth client ID, used by the web Google sign-in flow.
  - `VITE_GOOGLE_REDIRECT_URI`: public web OAuth callback URL, used by that flow. For local development use `http://localhost:5173/authenticate`; it must match the URI configured with the OAuth provider.
- Google sign-in uses authorization code with PKCE. Configure the web client ID and exact callback URI in Google and the backend. The Android callback continues to use its deep link.
- Vite embeds `VITE_*` variables in frontend assets. Do not put client secrets, API keys that must remain private, or other secrets in them; keep those in backend configuration.
- If the backend URL is missing, API requests fail with a configuration error. Consumer pages that load data require a configured backend.
- Token storage: `src/auth/tokenStore.ts`
- MVP persistence uses `localStorage` key `short_video_access_token`; this is simple for MVP but exposes tokens to XSS, so production should prefer an httpOnly cookie or stricter storage/session strategy.
- Usage examples: `src/services/usageExamples.ts`

## Included Views

- Admin login page using backend authentication
- Video review list with status filters
- Review detail with backend video preview
- Approve/reject actions and rejection reason picker
- Policy center base
- Backend configuration via environment variables

Admin moderation uses `/admin/videos` with offset pagination. Backend does not provide aggregate dashboard statistics.

## Consumer web

Consumer routes use the backend configured by VITE_API_BASE_URL. Feed, latest videos, my videos and comments use cursor pagination. Signed media URLs are used directly.

Run API contract tests with `node --test tests/api-integration.test.mjs`.
