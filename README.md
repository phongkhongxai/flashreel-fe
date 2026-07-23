# FlashReel Admin Website

React + Vite admin website for the FlashReel MVP video review workflow.

## Repositories

| Component | Repository |
|-----------|------------|
| 🖥 Backend | https://github.com/phongkhongxai/flashreel-be |
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
cd source_code/frontend
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Mock Admin Auth

- Public route: `/login`
- Protected route: `/`
- Successful mock login stores `flashreel-admin-token` and `flashreel-admin-user`
- Logout clears both `localStorage` and `sessionStorage`, then redirects to `/login`

## API Client

Typed API modules live in `src/api/`.

- Base URL: `src/config/env.ts`
- Vite env variable: `VITE_API_BASE_URL`
- Example: copy `.env.example` to `.env` and set `VITE_API_BASE_URL=http://localhost:8080`
- Token storage: `src/auth/tokenStore.ts`
- MVP persistence uses `localStorage` key `short_video_access_token`; this is simple for MVP but exposes tokens to XSS, so production should prefer an httpOnly cookie or stricter storage/session strategy.
- Usage examples: `src/api/usageExamples.ts`

## Included Views

- Admin login page with mock authentication
- Video review list with status filters
- Review detail with video preview placeholder
- Approve/reject actions and rejection reason picker
- Policy center base
- Settings page for API base configuration

The current React app uses mock data and is ready to wire to `/api/v1/admin/videos`.
