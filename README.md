# Spotify Sound Card

Animated **now playing** SVG widget for your GitHub profile README. Shows the current track, album art, and equalizer bars when music is playing.

![Preview](https://img.shields.io/badge/endpoint-SVG%20card-1DB954)

## Features

- Real-time track title, artist, and album cover
- Animated green equalizer bars while playing
- Base64-embedded cover art (works with GitHub's image proxy)
- 30s CDN cache to limit Spotify API usage

## Quick start

### 1. Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and create an app.
2. Add redirect URI: `http://127.0.0.1:8888/callback`
3. Copy **Client ID** and **Client Secret**.

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET`.

### 3. Get refresh token

```bash
npm run get-token
```

Open the printed URL, approve access, then paste the printed `SPOTIFY_REFRESH_TOKEN` into `.env.local`.

### 4. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for a live preview.

## Deploy to Vercel (GitHub Actions)

Pushes to `main` deploy production via [`.github/workflows/deploy-production.yml`](.github/workflows/deploy-production.yml).

### One-time setup

1. **Create a Vercel project** (import this repo in the [Vercel dashboard](https://vercel.com/new) or run `npx vercel link` locally).

2. **Add Spotify env vars** in Vercel → Project → Settings → Environment Variables (Production):
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`

3. **Create a Vercel token** at [vercel.com/account/tokens](https://vercel.com/account/tokens).

4. **Get org & project IDs** after linking:
   ```bash
   npx vercel link
   cat .vercel/project.json
   ```

5. **Add GitHub repository secrets** (Settings → Secrets and variables → Actions):

   | Secret | Value |
   |--------|-------|
   | `VERCEL_TOKEN` | Vercel access token |
   | `VERCEL_ORG_ID` | `orgId` from `.vercel/project.json` |
   | `VERCEL_PROJECT_ID` | `projectId` from `.vercel/project.json` |

6. Push to `main` — or run the workflow manually from the **Actions** tab (`workflow_dispatch`).

## GitHub README embed

After deploy, add to your profile README:

```markdown
![Spotify Now Playing](https://your-app.vercel.app/api/spotify)
```

## API

| Endpoint        | Returns                          |
|-----------------|----------------------------------|
| `GET /api/spotify` | `image/svg+xml` now-playing card |

## Project structure

```
app/
  api/spotify/route.ts   # Spotify API + SVG generation
  page.tsx               # Local preview + setup guide
lib/
  spotify.ts             # Types + XML helpers
  svg-card.ts            # SVG template
scripts/
  get-refresh-token.mjs  # OAuth helper for refresh token
```

## Notes

- Spotify must be actively playing on a device linked to your account.
- If nothing is playing, the card shows an "Offline" state.
- GitHub README images are cached; updates may lag by ~30–60 seconds.

## License

MIT
