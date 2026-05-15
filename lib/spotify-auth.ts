export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-playback-state",
] as const

const DEFAULT_REDIRECT_URI = "https://js-spotify-sound-card.vercel.app/"

export function getSpotifyRedirectUri(): string {
  return process.env.SPOTIFY_REDIRECT_URI?.trim() || DEFAULT_REDIRECT_URI
}

export function buildSpotifyAuthUrl(clientId: string): string {
  const url = new URL("https://accounts.spotify.com/authorize")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("response_type", "code")
  url.searchParams.set("redirect_uri", getSpotifyRedirectUri())
  url.searchParams.set("scope", SPOTIFY_SCOPES.join(" "))
  url.searchParams.set("show_dialog", "true")
  return url.toString()
}

export async function exchangeSpotifyCode(code: string) {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET")
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getSpotifyRedirectUri(),
    }),
  })

  const data = (await res.json()) as {
    refresh_token?: string
    error?: string
    error_description?: string
  }

  if (!res.ok) {
    throw new Error(
      data.error_description || data.error || "Token exchange failed",
    )
  }

  return data
}
