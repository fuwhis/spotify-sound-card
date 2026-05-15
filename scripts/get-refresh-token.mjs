import { exec } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { createServer } from "node:http"
import { resolve } from "node:path"

const PORT = 8888
const REDIRECT_URI = `http://localhost:${PORT}/callback`
const SCOPES = ["user-read-currently-playing", "user-read-playback-state"].join(" ")

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) {
    console.error("Missing .env.local — copy .env.example first.")
    process.exit(1)
  }

  const vars = {}
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) vars[match[1].trim()] = match[2].trim()
  }
  return vars
}

async function exchangeCode(clientId, clientSecret, code) {
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
      redirect_uri: REDIRECT_URI,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    console.error("\nToken exchange failed:")
    console.error(JSON.stringify(data, null, 2))
    console.error("\nCommon fixes:")
    console.error("- Redirect URI in Spotify Dashboard must be exactly:")
    console.error(`  ${REDIRECT_URI}`)
    console.error("- Authorization codes expire in ~60s — run the script again")
    console.error("- Client ID / Secret in .env.local must match the Spotify app")
    process.exit(1)
  }
  return data
}

function printRefreshToken(refresh_token) {
  console.log("\n✓ Add this to your .env.local:\n")
  console.log(`SPOTIFY_REFRESH_TOKEN=${refresh_token}\n`)
}

function htmlPage(title, body) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:32rem;margin:3rem auto;padding:0 1rem;line-height:1.5}
code{background:#f4f4f5;padding:.15rem .35rem;border-radius:4px}</style></head>
<body><h1>${title}</h1>${body}</body></html>`
}

const env = loadEnv()
const clientId = env.SPOTIFY_CLIENT_ID
const clientSecret = env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env.local")
  process.exit(1)
}

const manualCode = process.argv.find((arg) => arg.startsWith("--code="))?.split("=")[1]

if (manualCode) {
  const { refresh_token } = await exchangeCode(clientId, clientSecret, manualCode)
  printRefreshToken(refresh_token)
  process.exit(0)
}

console.log("\n── Spotify Dashboard (required) ──")
console.log("Settings → Redirect URIs → Add exactly:")
console.log(`  ${REDIRECT_URI}`)
console.log("(Save — changes can take a minute to apply)\n")

const authUrl = new URL("https://accounts.spotify.com/authorize")
authUrl.searchParams.set("client_id", clientId)
authUrl.searchParams.set("response_type", "code")
authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
authUrl.searchParams.set("scope", SCOPES)
authUrl.searchParams.set("show_dialog", "true")

console.log("1. Open this URL in your browser:\n")
console.log(authUrl.toString())
console.log("\n2. Approve access — browser redirects to localhost and this script prints your refresh token.")
console.log("\nIf the browser cannot connect after login, copy the ?code=... value from the address bar and run:")
console.log("  npm run get-token -- --code=PASTE_CODE_HERE\n")

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`)

  if (url.pathname === "/") {
    res.writeHead(302, { Location: authUrl.toString() })
    res.end()
    return
  }

  if (url.pathname !== "/callback") {
    res.writeHead(404, { "Content-Type": "text/html" })
    res.end(htmlPage("Not found", "<p>Expected path: <code>/callback</code></p>"))
    return
  }

  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
  const errorDescription = url.searchParams.get("error_description")

  if (error || !code) {
    const detail = [error, errorDescription].filter(Boolean).join(": ") || "No code received"
    res.writeHead(400, { "Content-Type": "text/html" })
    res.end(
      htmlPage(
        "Authorization failed",
        `<p>${detail}</p>
         <p>Check Redirect URI in Spotify Dashboard:<br><code>${REDIRECT_URI}</code></p>
         <p>Then run <code>npm run get-token</code> again.</p>`,
      ),
    )
    console.error("\nAuthorization failed:", detail)
    server.close()
    process.exit(1)
  }

  try {
    const { refresh_token } = await exchangeCode(clientId, clientSecret, code)

    res.writeHead(200, { "Content-Type": "text/html" })
    res.end(
      htmlPage(
        "Success",
        "<p>Refresh token printed in your terminal.</p><p>You can close this tab.</p>",
      ),
    )
    server.close()
    printRefreshToken(refresh_token)
  } catch (err) {
    console.error(err)
    res.writeHead(500, { "Content-Type": "text/html" })
    res.end(htmlPage("Error", "<p>See terminal for details.</p>"))
    server.close()
    process.exit(1)
  }
})

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nPort ${PORT} is already in use. Stop the other process or run:`)
    console.error(`  lsof -ti:${PORT} | xargs kill\n`)
  } else {
    console.error("\nServer error:", err.message)
  }
  process.exit(1)
})

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Listening on ${REDIRECT_URI}`)

  if (process.platform === "darwin") {
    exec(`open "${authUrl.toString()}"`, (err) => {
      if (err) console.log("(Could not auto-open browser — open the URL manually)")
    })
  }
})
