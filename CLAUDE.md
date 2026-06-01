# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands are run from the `src/` directory:

- `npm install` — install Next.js + sqlite3 + animejs
- `npm run dev` — Next.js dev server with HMR on port 3000
- `npm run build` — production build (typechecks every file)
- `npm start` — run the production build (after `npm run build`)
- `npm run lint` — Next.js ESLint

There is no separate test suite. Manual verification flows live in `/Users/wvh/.claude/plans/toasty-fluttering-pine.md` if needed.

The Next.js server listens on port 3000. Uploaded files are written to `./uploads/` *relative to the working directory*, so the server must be started from `src/` or `mkdir`/the file path won't match what the route handlers expect.

## Architecture

FilePile is a Next.js 15 (App Router) app that serves both a web UI and the JSON API on the same port.

- **`src/app/page.tsx`** — single page composing three client components: `UploadCard` (drag-and-drop + XHR progress bar), `LookupCard` (file ID lookup), `StatsStrip` (animated counters). All animations use **anime.js v3** in `'use client'` components; a shared `useReducedMotion()` hook in `src/lib/` collapses durations to 0 when the OS prefers reduced motion.
- **`src/app/api/*/route.ts`** — four Node-runtime route handlers (`upload`, `download/[fileId]`, `info/[fileId]`, `statistics`). They speak the same JSON shapes the README documents; the only URL change vs. the previous Express app is the `/api/` prefix.
- **`src/lib/db.ts`** — shared sqlite3 connection cached on `globalThis.__filepileDb` so dev-mode hot reloads don't re-open the file each request. Exposes `execute`, `fetchAll`, `fetchFirst` promise wrappers and a `getDb()` that lazily runs the schema bootstrap.
- **`src/lib/files.ts`** — `EXPIRY_MS` (10 min), `MAX_UPLOAD_BYTES` (100 MB), `generateFileId()` (5-char alphanumeric via `Math.random`), and `scheduleCleanup()` which fires a `setTimeout` to delete the file from disk and the row from the DB.
- **`src/lib/uploadWithProgress.ts`** — `XMLHttpRequest`-backed upload helper. `fetch` cannot report upload progress portably; XHR's `upload.onprogress` is the reliable path.

### File expiry — important caveat (preserved from v1)

Expiry is enforced by an in-memory `setTimeout` scheduled when the file is uploaded (`src/lib/files.ts:scheduleCleanup`). **If the server restarts, all pending timers are lost** — orphan files will remain on disk and in the `files` table forever. There's no startup sweep to reconcile this.

### Single sqlite3 connection

`getDb()` returns a singleton `sqlite3.Database` for the process. Bootstrap (`CREATE TABLE IF NOT EXISTS` + initial statistics row) runs once on first access. The earlier "two DB connections at startup" quirk from the Express version is gone.

When making changes, keep the API contract (JSON shapes, `fileId` format, `/api/` URLs) stable — the README documents it as the user-facing CLI interface.
