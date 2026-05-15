export type SpotifyArtist = { name: string }

export type SpotifyTrack = {
  name: string
  artists: SpotifyArtist[]
  album: { images: { url: string }[] }
}

export type CurrentlyPlaying = {
  is_playing: boolean
  item: SpotifyTrack
}

export function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1)}…`
}
