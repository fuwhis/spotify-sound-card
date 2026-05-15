import { NextResponse } from "next/server"
import type { CurrentlyPlaying } from "@/lib/spotify"
import { generateSVG } from "@/lib/svg-card"

const SVG_HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "public, s-maxage=30, stale-while-revalidate=15",
} as const

const OFFLINE_HEADERS = {
  "Content-Type": "image/svg+xml",
  "Cache-Control": "public, s-maxage=60",
} as const

function offlineSVG() {
  return generateSVG("Offline", "Not listening", "")
}

function missingConfigSVG() {
  return generateSVG("Setup required", "Add Spotify credentials to .env.local", "")
}

async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken || refreshToken === "your_refresh_token") {
    return null
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!tokenResponse.ok) {
    console.error("Spotify token error:", await tokenResponse.text())
    return null
  }

  const { access_token } = (await tokenResponse.json()) as { access_token?: string }
  return access_token ?? null
}

async function getNowPlaying(accessToken: string) {
  return fetch("https://api.spotify.com/v1/me/player/currently-playing", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  })
}

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    if (!accessToken) {
      return new NextResponse(missingConfigSVG(), { headers: OFFLINE_HEADERS })
    }

    const response = await getNowPlaying(accessToken)

    if (response.status === 204 || response.status > 400) {
      return new NextResponse(offlineSVG(), { headers: OFFLINE_HEADERS })
    }

    const song = (await response.json()) as CurrentlyPlaying
    const title = song.item.name
    const artist = song.item.artists.map((a) => a.name).join(", ")
    const coverUrl = song.item.album.images[0]?.url

    let coverBase64 = ""
    if (coverUrl) {
      const coverBuffer = await fetch(coverUrl).then((res) => res.arrayBuffer())
      coverBase64 = `data:image/jpeg;base64,${Buffer.from(coverBuffer).toString("base64")}`
    }

    const svg = generateSVG(title, artist, coverBase64, song.is_playing)
    return new NextResponse(svg, { headers: SVG_HEADERS })
  } catch (error) {
    console.error("Spotify API Error:", error)
    return new NextResponse(offlineSVG(), { headers: OFFLINE_HEADERS })
  }
}
