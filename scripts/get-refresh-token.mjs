import { createServer } from "node:http"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const REDIRECT_URI = "http://127.0.0.1:8888/callback"
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
    console.error("Token exchange failed:", data)
    process.exit(1)
  }
  return data
}

const env = loadEnv()
const clientId = env.SPOTIFY_CLIENT_ID
const clientSecret = env.SPOTIFY_CLIENT_SECRET

if (!clientId || !clientSecret) {
  console.error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set in .env.local")
  process.exit(1)
}

const authUrl = new URL("https://accounts.spotify.com/authorize")
authUrl.searchParams.set("client_id", clientId)
authUrl.searchParams.set("response_type", "code")
authUrl.searchParams.set("redirect_uri", REDIRECT_URI)
authUrl.searchParams.set("scope", SCOPES)

console.log("\n1. Open this URL in your browser:\n")
console.log(authUrl.toString())
console.log("\n2. Approve access — you will be redirected back here automatically.\n")

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`)
  if (url.pathname !== "/callback") {
    res.writeHead(404)
    res.end("Not found")
    return
  }

  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")

  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/html" })
    res.end(`<h1>Authorization failed</h1><p>${error ?? "No code received"}</p>`)
    server.close()
    process.exit(1)
  }

  const { refresh_token } = await exchangeCode(clientId, clientSecret, code)

  res.writeHead(200, { "Content-Type": "text/html" })
  res.end("<h1>Success!</h1><p>You can close this tab and return to the terminal.</p>")
  server.close()

  console.log("\n✓ Add this to your .env.local:\n")
  console.log(`SPOTIFY_REFRESH_TOKEN=${refresh_token}\n`)
})

server.listen(8888, "127.0.0.1", () => {
  console.log(`Listening on ${REDIRECT_URI}`)
})
