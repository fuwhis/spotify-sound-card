import Link from "next/link"
import { exchangeSpotifyCode, getSpotifyRedirectUri } from "@/lib/spotify-auth"

const CARD_URL = "/api/spotify"
const LOGIN_URL = "/api/spotify/login"

type PageProps = {
  searchParams: Promise<{
    code?: string
    error?: string
    error_description?: string
  }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const redirectUri = getSpotifyRedirectUri()

  let setupResult: { refreshToken: string } | { error: string } | null = null

  if (params.error) {
    setupResult = {
      error: params.error_description || params.error,
    }
  } else if (params.code) {
    try {
      const data = await exchangeSpotifyCode(params.code)
      if (!data.refresh_token) {
        setupResult = { error: "No refresh token returned. Try authorizing again." }
      } else {
        setupResult = { refreshToken: data.refresh_token }
      }
    } catch (err) {
      setupResult = {
        error: err instanceof Error ? err.message : "Token exchange failed",
      }
    }
  }

  const embedMarkdown = `![Spotify Now Playing](https://js-spotify-sound-card.vercel.app/api/spotify)`

  return (
    <div className="min-h-full bg-[#0a0a0a] text-zinc-100">
      <header className="mx-auto max-w-2xl px-6 pt-16 pb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-[#1DB954]">
          Spotify Sound Card
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Animated now-playing widget for GitHub README
        </h1>
        <p className="mt-3 text-zinc-400 leading-relaxed">
          Deploy this app, embed the SVG endpoint in your profile README, and it
          updates with your current track and animated equalizer bars.
        </p>
      </header>

      {setupResult && (
        <section className="mx-auto max-w-2xl px-6 pb-10">
          <div
            className={`rounded-lg border p-4 ${
              "refreshToken" in setupResult
                ? "border-[#1DB954]/40 bg-[#1DB954]/10"
                : "border-red-500/40 bg-red-500/10"
            }`}
          >
            {"refreshToken" in setupResult ? (
              <>
                <h2 className="text-lg font-semibold text-[#1DB954]">
                  Refresh token ready
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Add to Vercel → Settings → Environment Variables (Production), then
                  redeploy:
                </p>
                <pre className="mt-3 overflow-x-auto rounded bg-black/40 p-3 text-sm text-zinc-200">
                  <code>SPOTIFY_REFRESH_TOKEN={setupResult.refreshToken}</code>
                </pre>
                <p className="mt-2 text-xs text-zinc-500">
                  Also add to <code className="text-zinc-400">.env.local</code> for local dev.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold text-red-400">Setup failed</h2>
                <p className="mt-2 text-sm text-zinc-400">{setupResult.error}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  Redirect URI in Spotify Dashboard must be exactly:{" "}
                  <code className="text-zinc-300">{redirectUri}</code>
                </p>
                <Link
                  href={LOGIN_URL}
                  className="mt-4 inline-block text-sm text-[#1DB954] hover:underline"
                >
                  Try again →
                </Link>
              </>
            )}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-2xl px-6 pb-10">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">Connect Spotify</h2>
        <p className="mb-3 text-sm text-zinc-400">
          Redirect URI on Spotify Dashboard:{" "}
          <code className="text-zinc-300">{redirectUri}</code>
        </p>
        <Link
          href={LOGIN_URL}
          className="inline-flex items-center rounded-full bg-[#1DB954] px-5 py-2.5 text-sm font-medium text-black transition hover:bg-[#1ed760]"
        >
          Authorize Spotify →
        </Link>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-10">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">Live preview</h2>
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#121212] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={CARD_URL}
            alt="Spotify now playing card"
            width={500}
            height={140}
            className="block max-w-full h-auto"
          />
        </div>
        <p className="mt-2 text-xs text-zinc-600">
          Refreshes every ~30s via cache headers. Play something on Spotify to see
          the waveform.
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-10">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">README embed</h2>
        <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/80 p-4 text-sm text-zinc-300">
          <code>{embedMarkdown}</code>
        </pre>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-20">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">Quick setup</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400 leading-relaxed">
          <li>
            Spotify Dashboard → Redirect URI:{" "}
            <code className="text-zinc-300">{redirectUri}</code>
          </li>
          <li>
            Set <code className="text-zinc-300">SPOTIFY_CLIENT_ID</code> and{" "}
            <code className="text-zinc-300">SPOTIFY_CLIENT_SECRET</code> on Vercel
          </li>
          <li>
            Open{" "}
            <Link href={LOGIN_URL} className="text-[#1DB954] hover:underline">
              /api/spotify/login
            </Link>{" "}
            (or click Authorize above) to get refresh token
          </li>
          <li>
            Add <code className="text-zinc-300">SPOTIFY_REFRESH_TOKEN</code> on Vercel
            and redeploy
          </li>
        </ol>
      </section>
    </div>
  )
}
