# Phase 1 Plan — Accounts & Multi-User (making phase)

Date: 2026-09-22. Approved by Boss. Build in ~/workspace/work/yahya-studio-prod.
Nothing pushes to GitHub without Boss's explicit permission.

## Target architecture (free tiers, making phase)

| Piece            | Service            | Free tier notes                              |
|------------------|--------------------|----------------------------------------------|
| Frontend (React) | Vercel             | Hobby free, auto-deploys from GitHub         |
| Backend (FastAPI)| Render             | Free web service (sleeps when idle, 750h/mo) |
| Database         | Supabase Postgres  | Free 500MB                                   |
| Auth             | Supabase Auth      | Free, email/password, 50k MAU                |
| File storage     | Supabase Storage   | Free 1GB, per-user folders                   |

Why: Supabase gives auth + DB + storage in one free tier — ideal for Phase 1.
Vercel cannot run the render backend (serverless timeouts) → frontend only.
Render free has ephemeral disk → uploads/exports MUST live in Supabase Storage,
never on Render's local disk.

Production later (real users): Hetzner VPS (~€4-5/mo, persistent disk, no sleep)
or Render paid + Cloudflare R2 storage. Not now.

## Data model (Supabase Postgres)

- `profiles` (id uuid PK = auth.users.id, email, display_name, storage_used_bytes, created_at)
- `projects` (id uuid PK, user_id FK → profiles, name, data jsonb = timeline, created_at, updated_at)
- `media_files` (id uuid PK, user_id FK, bucket_path, kind, filename, size_bytes, created_at)
- `api_keys` (id uuid PK, user_id FK, provider, secret_encrypted, created_at)
- `exports` (id uuid PK, user_id FK, project_id FK, bucket_path, status, created_at)

Row Level Security: user can only read/write rows where user_id = auth.uid().

## Storage layout (Supabase Storage bucket `user-media`)

`<user_id>/uploads/...`, `<user_id>/exports/...` — backend generates signed URLs.

## Backend changes (FastAPI)

1. Verify Supabase JWT on every /api route → `current_user_id` dependency.
2. Scope ALL queries by user_id (projects, media, keys, exports).
3. DELETE local-folder endpoints: `/api/select-folder`, folder-scan of server disk.
   Replace with user-scoped `/api/media` backed by Supabase Storage.
4. Upload endpoint streams to Supabase Storage under `<user_id>/`.
5. Serve media via signed URLs (never raw disk paths).
6. Alembic/SQL migrations for tables; RLS policies in SQL.

## Frontend changes (React)

1. AuthContext + Login / Signup / Logout pages; token in memory + refresh.
2. Protected routes — editor requires login.
3. Media library reads `/api/media` (user-scoped), upload to user's storage.
4. API keys panel → per-user keys (already masked display; keep).
5. Account page: profile, storage usage bar, change password, delete account.

## Deploy flow (when Boss approves)

1. Push prod branch to GitHub (explicit permission first).
2. Boss creates free accounts: Supabase, Vercel, Render (5 min, his side).
3. Connect GitHub repo → Vercel (frontend) + Render (backend, env vars).
4. Every later `git push` auto-redeploys (~2-5 min). DB migrations via Supabase SQL editor.

## Out of scope for Phase 1

- Voice-over AI upgrade, new free-AI tools (Phase 3)
- Quotas/billing, teams, public sharing links
- Migrating old localhost JSON projects (fresh start; importer later if needed)
