import { NextResponse } from "next/server"
import { buildSpotifyAuthUrl } from "@/lib/spotify-auth"

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID

  if (!clientId) {
    return NextResponse.json(
      { error: "SPOTIFY_CLIENT_ID is not configured on the server" },
      { status: 500 },
    )
  }

  return NextResponse.redirect(buildSpotifyAuthUrl(clientId))
}
