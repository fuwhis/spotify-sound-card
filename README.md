# Spotify Sound Card

<p align="center">
  <strong>Live “now playing” SVG for your GitHub profile</strong><br/>
  Track · artist · album art · animated equalizer — zero JavaScript on the client.
</p>

<p align="center">
  <a href="https://spotify-sound-card.vercel.app/api/spotify">
    <img
      src="https://spotify-sound-card.vercel.app/api/spotify"
      alt="Spotify Now Playing"
      width="500"
    />
  </a>
</p>

<p align="center">
  <a href="https://spotify-sound-card.vercel.app">
    <img src="https://img.shields.io/badge/Live-Demo-1DB954?style=for-the-badge&logo=vercel&logoColor=white" alt="Live demo" />
  </a>
  <a href="https://github.com/fuwhis/spotify-sound-card/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/fuwhis/spotify-sound-card/ci.yml?branch=main&style=for-the-badge&label=CI" alt="CI" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT" />
  </a>
</p>

---

## Drop into your profile README

```markdown
![Spotify Now Playing](https://spotify-sound-card.vercel.app/api/spotify)
```

That’s it — GitHub’s image proxy fetches a fresh SVG whenever the README is viewed.

> Deploy your own fork if you want a private card tied to _your_ Spotify account (see [Setup](#setup)).

---

## Why this exists

GitHub READMEs are static Markdown. This project turns Spotify’s currently-playing API into a **self-contained SVG** so your profile stays dynamic without embeds, iframes, or client-side scripts.

| Playing                             | Paused / idle                      |
| ----------------------------------- | ---------------------------------- |
| Album cover + title + artist        | Same layout                        |
| Green equalizer bars animate        | “Currently paused” / Offline state |
| Cover inlined as base64 (Camo-safe) | No external image hops             |

**Stack:** Next.js · Spotify Web API · Vercel · pure SVG.

---

## Features

- **Real-time now playing** — title, artist, album art from Spotify
- **Animated equalizer** — CSS keyframes inside the SVG while music is playing
- **GitHub-friendly** — base64 cover + `Cache-Control: no-cache` for Camo; soft CDN cache on Vercel (~30s) to spare the Spotify API
- **Offline-aware** — clear Offline / setup states when nothing is playing or credentials are missing
- **One-click OAuth path** — `/api/spotify/login` after deploy, or local `pnpm get-token`

---

## Live endpoints

| Path                                                                                | What you get                         |
| ----------------------------------------------------------------------------------- | ------------------------------------ |
| [`GET /api/spotify`](https://spotify-sound-card.vercel.app/api/spotify)             | `image/svg+xml` now-playing card     |
| [`GET /api/spotify/login`](https://spotify-sound-card.vercel.app/api/spotify/login) | Spotify OAuth → prints refresh token |
| [Homepage](https://spotify-sound-card.vercel.app)                                   | Preview + setup guide                |

---

## Setup

### 1. Spotify app

1. Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Add redirect URI (**exact match**, including trailing slash):

   ```
   https://spotify-sound-card.vercel.app/
   ```

   For local token helper, also add `http://localhost:8888/callback`.

3. Copy **Client ID** and **Client Secret**.

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable                | Required | Notes                      |
| ----------------------- | -------- | -------------------------- |
| `SPOTIFY_CLIENT_ID`     | yes      | From Spotify Dashboard     |
| `SPOTIFY_CLIENT_SECRET` | yes      | From Spotify Dashboard     |
| `SPOTIFY_REFRESH_TOKEN` | yes      | From OAuth step below      |
| `SPOTIFY_REDIRECT_URI`  | optional | Defaults to production URL |

### 3. Refresh token

**Production (recommended)**

1. Deploy and set `SPOTIFY_CLIENT_ID` + `SPOTIFY_CLIENT_SECRET` on Vercel.
2. Open [/api/spotify/login](https://spotify-sound-card.vercel.app/api/spotify/login) and approve access.
3. Copy `SPOTIFY_REFRESH_TOKEN` from the homepage → add to Vercel → redeploy.

**Local**

```bash
pnpm get-token
```

### 4. Develop locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the live preview.

---

## Deploy

### Vercel + GitHub Actions

Production deploys on push to `main` via [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (`vercel pull` → `build` → `deploy --prebuilt`).

**One-time**

1. Create / link a Vercel project (`pnpm dlx vercel link`).
2. Set Spotify env vars on Vercel (Production).
3. Create a [Vercel token](https://vercel.com/account/tokens).
4. Add GitHub Actions secrets:

   | Secret              | Source                               |
   | ------------------- | ------------------------------------ |
   | `VERCEL_TOKEN`      | Vercel account token                 |
   | `VERCEL_ORG_ID`     | `.vercel/project.json` → `orgId`     |
   | `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

5. Push to `main`, or run the workflow from the **Actions** tab.

If Vercel Git Integration is also enabled, disable one of the two deploy paths to avoid double builds.

---

## Project layout

```
app/
  api/spotify/route.ts     # Now-playing → SVG
  api/spotify/login/       # OAuth entry
  page.tsx                 # Preview + setup UI
lib/
  svg-card.ts              # SVG template + equalizer
  spotify.ts               # Types / XML helpers
  spotify-auth.ts          # Auth helpers
scripts/
  get-refresh-token.mjs    # Local OAuth helper
```

---

## Notes

- Spotify must be actively playing on a device linked to your account for the “playing” state.
- GitHub Camo may still lag a bit between refreshes; the API itself is dynamic.
- Fork & deploy your own instance for a personal card — don’t share your refresh token.

---

## License

[MIT](LICENSE)
