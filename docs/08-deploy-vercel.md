# Deploying MINDTHREAD to Vercel (with Supabase Postgres)

## Why signup failed before
The app used a **SQLite file** (`prisma/dev.db`). Vercel runs API routes as **serverless functions with a read-only filesystem**, so any write (like creating a user on signup) fails → generic `500 "Something went wrong"`. Plus `.env` is git-ignored, so secrets weren't deployed. SQLite is dev-only; production needs a hosted DB.

## What was changed (done)
- Prisma datasource: `sqlite` → **`postgresql`** with `directUrl` ([prisma/schema.prisma](../prisma/schema.prisma)).
- Generator `binaryTargets = ["native", "rhel-openssl-3.0.x"]` (Vercel's serverless engine).
- Build script → `prisma generate && next build` (Prisma client is generated on every Vercel build).
- Schema pushed + demo data seeded into the Supabase database.

## ⚠️ The connection-string gotcha (read this)
- The **direct** connection `db.<ref>.supabase.co:5432` is **IPv6-only**. **Vercel functions are IPv4-only**, so this URL **fails on Vercel**.
- On Vercel, `DATABASE_URL` **must** be the **Transaction pooler** string (IPv4, port **6543**).
- URL-encode special chars in the password (`/` → `%2F`).

Get the pooler string from **Supabase → Project Settings → Database → Connection string → "Connection pooling" → Mode: Transaction**. It looks like:
```
postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Vercel environment variables
Set these in **Vercel → Project → Settings → Environment Variables** (Production + Preview + Development):

| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase **Transaction pooler** string (6543, IPv4) + `?pgbouncer=true` |
| `DIRECT_URL` | Supabase **direct** string (5432). Only used by migrations; harmless at runtime |
| `AUTH_SECRET` | A long random string (use the one in your local `.env`) |
| `ENCRYPTION_KEY` | 64 hex chars — **must equal your local value** (encrypts the Gemini key in the shared DB) |

> Use the **same** `ENCRYPTION_KEY` everywhere that shares this database, or saved API keys can't be decrypted.

## Deploy
1. Push the repo to GitHub and import it in Vercel (or `vercel --prod`).
2. Add the 4 env vars above.
3. Redeploy. The build runs `prisma generate && next build`.
4. The schema is already in Supabase; the demo login works: `demo@mindthread.app` / `demo12345`.

## Running migrations later
Schema changes are applied with the **direct** connection from your machine:
```bash
npx prisma db push      # uses DIRECT_URL
```
(Not run on Vercel — keep it a manual/local step.)

## Security note
The DB password was shared in chat — rotate it in Supabase (Settings → Database → Reset password) and update `DATABASE_URL`/`DIRECT_URL` locally and on Vercel.
