# Admin Migration & DB Foundation — Summary

This file collects the plan, work completed, diagnostics, and next steps so you can pick up where you left off (or continue from another account).

---

## Project context
- Next.js App Router site (TypeScript, Tailwind, shadcn components).
- Cloudinary is used for media storage.
- Drizzle ORM + Drizzle Kit used for DB layer.
- Neon (Postgres) is the target DB host.

---

## Agreed plan (high level)
1. Add a small Postgres metadata layer (Drizzle + Neon) — done.
2. Implement DB-backed portfolio items table and migration — done.
3. Update server API routes to persist uploads and read portfolio items from DB — done (server routes modified earlier).
4. Add admin endpoints for edit/reorder/delete — added (server routes present).
5. Implement admin UI to manage portfolio items (deferred until uploads are confirmed).
6. One-off migration of existing Cloudinary library into DB (after admin test succeeds).

---

## What I changed (files I edited/added)
- Changed `drizzle.config.ts` to v0.21+ format (use `dialect: 'postgresql'` and `dbCredentials.url`).
  - File: [drizzle.config.ts](drizzle.config.ts)

- Replaced DB client to use Neon serverless driver in `lib/db.ts`:
  - `import { Pool } from '@neondatabase/serverless'`
  - `import { drizzle } from 'drizzle-orm/neon-serverless'`
  - File: [lib/db.ts](lib/db.ts)

- Added Drizzle migration SQL (first migration):
  - `drizzle/migrations/0001_create_portfolio_items.sql` (creates `public.portfolio_items` + indexes)
  - File: [drizzle/migrations/0001_create_portfolio_items.sql](drizzle/migrations/0001_create_portfolio_items.sql)

- Added Drizzle schema (Drizzle table definition):
  - `db/schema.ts` defines `portfolioItems` (id, public_id, cloudinary_url, category, title, caption, sort_order, featured, active, width, height, created_at, updated_at)
  - File: [db/schema.ts](db/schema.ts)

- Updated API routes to persist/read/delete items from DB (server-side):
  - `app/api/upload/route.ts` — inserts a `portfolio_items` row after Cloudinary upload
  - `app/api/portfolio-images/route.ts` — reads active items from DB and returns them
  - `app/api/portfolio-delete/route.ts` — deletes DB record when deleting Cloudinary resource
  - `app/api/portfolio-item/route.ts` — PATCH metadata update endpoint
  - `app/api/portfolio-reorder/route.ts` — POST batch reorder endpoint

- Added helper scripts for migration/diagnostics:
  - `scripts/run_migrate.js` — loads `.env.local` and runs `pnpm run db:migrate`
  - `scripts/apply_migration.js` — applies the migration SQL directly (for environments where `drizzle-kit` had issues)
  - `scripts/db_check.js` — inspects `portfolio_items` existence, columns, and counts
  - `scripts/diagnose_permissions.js` — reports current role, has_create_on_public, and public schema owner
  - `scripts/test_admin_upload.js` — test script to upload a tiny PNG to Cloudinary and insert a DB row (used for testing)

- Added npm scripts in `package.json`:
  - `db:generate`, `db:migrate`, `db:studio` (call `drizzle-kit` with `drizzle.config.ts`)
  - File: [package.json](package.json)

---

## What I ran and verified
- `pnpm build` — Next build and TypeScript completed successfully after the DB changes.
- Drizzle/Neon migration attempts:
  - Initially migration failed due to permission error: `permission denied for schema public` when connected with the app role.
  - I diagnosed the DB role with `scripts/diagnose_permissions.js` and found:
    - `current_user`: `kcaptured-admin` (the app role)
    - `has_create_on_public`: `false`
    - `public` schema owner: `pg_database_owner`
  - After you updated `.env.local` to a privileged/owner-like connection, I applied the migration (used `scripts/apply_migration.js`) and confirmed:
    - `public.portfolio_items` exists
    - Columns match `db/schema.ts` (data types, nullability, defaults)
    - Row count = 0
  - Build again: `pnpm build` succeeded (no type errors)

- Cloudinary tests:
  - I attempted a direct programmatic upload test (`scripts/test_admin_upload.js` and a direct node snippet). Uploads returned HTTP 403 from Cloudinary.
  - Diagnostic output indicates Cloudinary rejected the request (most commonly due to credentials, account restrictions, or signed/unsigned preset expectations). You checked credentials letter-for-letter and reported they are correct; it's possible Cloudinary expects a signed upload or a preset/permissions issue.

---

## Current state (what's done)
- Drizzle + Neon DB foundation: completed.
- `drizzle/migrations/0001_create_portfolio_items.sql` applied to Neon (table created).
- `db/schema.ts` matches the applied migration.
- API routes updated to use the DB (server-side) for portfolio items.
- Build and TypeScript checks pass.

## Current state (what's not done / next tasks)
- Cloudinary upload flow currently failing (403). Until this is resolved, admin upload UI cannot be reliably tested.
- Revert runtime `DATABASE_URL` in deployment to use the least-privileged app role (if you used owner to run the migration).
- Test a single admin upload (once Cloudinary works) and verify a DB row is inserted and appears in `/api/portfolio-images`.
- Migrate existing Cloudinary library into the DB (one-off script) after test upload succeeds.
- Implement admin UI (deferred) to perform CRUD, reorder, and toggle visibility.
- Add CI step to run migrations using owner credentials only during deploy (best practice).

---

## Conversation summary (short)
- You asked to add a small Postgres metadata layer and keep the site UI unchanged.
- I added Drizzle schema, migration SQL, DB connection using Neon serverless, and updated APIs to persist/read portfolio items.
- Initial migration attempt failed due to `permission denied for schema public` — diagnosed as app role lacking CREATE on `public`.
- After you updated `.env.local` to an owner-capable connection, I applied the migration and confirmed `portfolio_items` exists and is empty.
- Cloudinary uploads tested from code produced HTTP 403; we investigated credentials and possible account/preset restrictions. You confirmed credentials are correct.
- You want to proceed to admin UI and then migrate media from library into DB to test upload in real time; I recommended fixing Cloudinary behavior first to avoid wasting credits.

---

## Exact commands and checks you can run (safe, no secrets printed)
- Run migrations (owner-level `DATABASE_URL` required):
```bash
pnpm run db:migrate
```

- Quick DB inspection (reads only):
```bash
node scripts/db_check.js
# or
node scripts/diagnose_permissions.js
```

- Test admin upload (will attempt real Cloudinary upload and DB insert):
```bash
node scripts/test_admin_upload.js
```

- Verify the table manually in Neon SQL Editor:
```sql
SELECT to_regclass('public.portfolio_items');
SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
 WHERE table_schema = 'public' AND table_name = 'portfolio_items'
 ORDER BY ordinal_position;
SELECT COUNT(*) FROM public.portfolio_items;
```

---

## Recommendations & safe process for migrating library media into DB
1. Fix Cloudinary upload issue first (403). Confirm upload works with a single test file.
2. Use the admin upload UI or the test script to create one sample DB row.
3. Once that succeeds, write a one-off migration script that:
   - Lists Cloudinary resources (use your existing `lib/cloudinary-uploads.ts` helpers)
   - Inserts them into `portfolio_items` with sensible `sort_order` and metadata
   - Run the script once (owner or role with INSERT privileges) and verify
4. Revert any privileged credentials used for migration back to a least-privileged runtime role.

---

## Notes & cautions
- Do not commit `.env.local` or any credentials. Use Neon and Vercel environment variables.
- For migrations in CI: store owner credentials in a secure CI secret and only expose them for the migration step, then unset/restrict them for runtime.

---

If you'd like, I can now:
- Prepare the one-off library-to-DB migration script (no UI changes) so you can run it when ready, or
- Build the admin UI (but you previously asked to defer UI until uploads are confirmed).

Tell me which of the two you'd like next and I'll proceed.
