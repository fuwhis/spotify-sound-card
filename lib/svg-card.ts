/**
 * Builds the now-playing card as an SVG image string for `/api/spotify`.
 *
 * SVG = Scalable Vector Graphics — an XML image format browsers and GitHub
 * Camo can display via `<img>`, including CSS-animated equalizer bars.
 * This module is not a React UI; it returns `image/svg+xml` markup.
 */
import { escapeXml, truncate } from "./spotify"

const BAR_COUNT = 40
const availableWidth = 340 // 500 - 140 - 20
const step = availableWidth / BAR_COUNT // 8.5
const BAR_WIDTH = 4
const BAR_RADIUS = BAR_WIDTH / 2 // fully rounded capsule ends
const PALETTE = [
  "#6a994e", "#005f73", "#0a9396", "#94d2bd", "#e9d8a6",
  "#ee9b00", "#ca6702", "#bb3e03", "#ae2012", "#9b2226",
] as const

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function generateSVG(
  title: string,
  artist: string,
  coverUrl: string,
  isPlaying = false
): string {
  const safeTitle = escapeXml(truncate(title, 32))
  const safeArtist = escapeXml(truncate(artist, 40))

  // Balanced: each palette color appears equally often, then shuffled
  const barColors = shuffle(
    Array.from({ length: BAR_COUNT }, (_, i) => PALETTE[i % PALETTE.length])
  )

  const bars = Array.from({ length: BAR_COUNT })
    .map((_, i) => {
      const animationDuration = (Math.random() * 0.7 + 0.5).toFixed(2)
      const height = Math.floor(Math.random() * 15) + 5
      return `<rect class="bar" x="${i * step}" y="${BAR_RADIUS}" width="${BAR_WIDTH}" height="${height}" rx="${BAR_RADIUS}" ry="${BAR_RADIUS}" style="animation-duration: ${animationDuration}s; fill: ${barColors[i]};" />`
    })
    .join("")

  const cover = coverUrl
    ? `<image href="${coverUrl}" x="20" y="20" height="100" width="100" clip-path="url(#rounded-corners)" />`
    : `<rect x="20" y="20" height="100" width="100" rx="8" fill="#333" />`

  return `<svg width="500" height="140" xmlns="http://www.w3.org/2000/svg">
  <style>
    .card { fill: #1a1a1a; }
    .text-title { font: bold 22px 'SF Pro Text', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; fill: #ffffff; }
    .text-artist { font: 16px 'SF Pro Text', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif; fill: #b3b3b3; }
    .bar { transform-origin: bottom; animation: bounce ease-in-out infinite alternate; }
    @keyframes bounce {
      0% { transform: scaleY(0.3); }
      100% { transform: scaleY(1); }
    }
  </style>

  <defs>
    <clipPath id="rounded-corners">
      <rect x="20" y="20" width="100" height="100" rx="8" />
    </clipPath>
  </defs>

  <rect width="500" height="140" rx="8" class="card" />
  ${cover}
  <text x="140" y="55" class="text-title">${safeTitle}</text>
  <text x="140" y="80" class="text-artist">${safeArtist}</text>

  <g transform="translate(140, 95)">
    ${isPlaying ? bars : `<text x="0" y="20" fill="#b3b3b3" font-size="12">Currently paused</text>`}
  </g>
</svg>`
}
