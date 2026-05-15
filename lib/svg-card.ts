import { escapeXml, truncate } from "./spotify"

export function generateSVG(
  title: string,
  artist: string,
  coverUrl: string,
  isPlaying = false
): string {
  const safeTitle = escapeXml(truncate(title, 32))
  const safeArtist = escapeXml(truncate(artist, 40))

  const bars = Array.from({ length: 40 })
    .map((_, i) => {
      const animationDuration = (Math.random() * 0.7 + 0.5).toFixed(2)
      const height = Math.floor(Math.random() * 15) + 5
      return `<rect class="bar" x="${i * 6}" y="${25 - height}" width="4" height="${height}" style="animation-duration: ${animationDuration}s;" />`
    })
    .join("")

  const cover = coverUrl
    ? `<image href="${coverUrl}" x="20" y="20" height="100" width="100" clip-path="url(#rounded-corners)" />`
    : `<rect x="20" y="20" height="100" width="100" rx="8" fill="#333" />`

  return `<svg width="500" height="140" xmlns="http://www.w3.org/2000/svg">
  <style>
    .card { fill: #1a1a1a; }
    .text-title { font: bold 22px 'Segoe UI', Arial, sans-serif; fill: #ffffff; }
    .text-artist { font: 16px 'Segoe UI', Arial, sans-serif; fill: #b3b3b3; }
    .bar { fill: #1DB954; transform-origin: bottom; animation: bounce ease-in-out infinite alternate; }
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
