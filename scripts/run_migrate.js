const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return
  const content = fs.readFileSync(file, 'utf8')
  for (const line of content.split(/\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    let val = trimmed.slice(eq + 1)
    // Remove surrounding quotes
    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

// Load .env.local from repo root if present
const repoRoot = path.resolve(__dirname, '..')
const envPath = path.join(repoRoot, '.env.local')
loadDotEnv(envPath)

// Verify DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL not found in environment or .env.local')
  process.exit(2)
}

console.log('Running drizzle migrations (using .env.local values, not displayed)')

// Use the local script so the installed `drizzle-kit` in this repo is used
// Call the local drizzle-kit binary directly so arguments are passed as expected
const cmd = './node_modules/.bin/drizzle-kit migrate --config ./drizzle.config.ts'
const child = spawn('sh', ['-lc', cmd], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code)
})
