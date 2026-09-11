import { NextResponse } from "next/server"
import { buildSpotifyAuthUrl } from "@/lib/spotify-auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID is not configured on the server" },
      { status: 500 },
    )
  }

  // 302 + Cache-Control: full browser navigation must follow this to Spotify.
  // Soft client fetches (e.g. Next.js <Link>) hit CORS on accounts.spotify.com.
  return NextResponse.redirect(buildSpotifyAuthUrl(clientId), {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
    },
  })
}
