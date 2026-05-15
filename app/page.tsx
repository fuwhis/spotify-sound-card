const CARD_URL = "/api/spotify"

export default function Home() {
  const embedMarkdown = `![Spotify Now Playing](${CARD_URL})`

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
        <p className="mt-2 text-xs text-zinc-600">
          After deploying to Vercel, replace the path with your production URL, e.g.{" "}
          <code className="text-zinc-400">
            https://your-app.vercel.app/api/spotify
          </code>
        </p>
      </section>

      <section className="mx-auto max-w-2xl px-6 pb-20">
        <h2 className="mb-3 text-sm font-medium text-zinc-500">Quick setup</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400 leading-relaxed">
          <li>
            Create an app at{" "}
            <a
              href="https://developer.spotify.com/dashboard"
              className="text-[#1DB954] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Spotify Developer Dashboard
            </a>{" "}
            and set redirect URI to{" "}
            <code className="text-zinc-300">http://127.0.0.1:8888/callback</code>
          </li>
          <li>
            Copy <code className="text-zinc-300">.env.example</code> to{" "}
            <code className="text-zinc-300">.env.local</code> and fill in Client ID &amp; Secret
          </li>
          <li>
            Run <code className="text-zinc-300">npm run get-token</code> to obtain a refresh token
          </li>
          <li>
            Run <code className="text-zinc-300">npm run dev</code> and open this page to preview
          </li>
          <li>Deploy to Vercel and paste the embed markdown into your GitHub README</li>
        </ol>
      </section>
    </div>
  )
}
