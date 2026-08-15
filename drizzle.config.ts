// Minimal Drizzle Kit config file.
// Use a plain default export to avoid strict type constraints in the build.
// Drizzle Kit v0.21+ expects `dialect` and `dbCredentials` (or a driver for special
// runtimes). Provide `process.env.DATABASE_URL` at runtime so secrets remain out
// of source control. This file is safe to commit because it does not contain
// the secret itself.
export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
}
