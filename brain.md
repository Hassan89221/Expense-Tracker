# Expense Tracker (Next.js) — Project Brain

## 1. Overview

A full-stack Expense Tracker web app built with Next.js. Single codebase handles both frontend and backend via App Router API routes. Deploys to Vercel with a PostgreSQL database.

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** JavaScript (no TypeScript)
- **Styling:** Tailwind CSS v4
- **ORM:** Prisma v7 with `prisma-client-js` generator
- **Database:** PostgreSQL (Neon / Vercel Postgres)
- **DB Adapter:** `@prisma/adapter-pg` (Prisma v7 driver adapter pattern)
- **Deployment:** Vercel

## 3. Folder Structure

```
expense-tracker/
├── prisma/
│   └── schema.prisma          # Prisma schema (Expense model)
├── prisma.config.ts           # Prisma config (datasource URL for migrations)
├── src/
│   ├── api/
│   │   └── client.js          # Frontend fetch wrappers (relative /api URLs)
│   ├── app/
│   │   ├── api/
│   │   │   └── expenses/
│   │   │       ├── route.js            # GET (list) + POST (create)
│   │   │       ├── [id]/route.js       # PUT (update) + DELETE
│   │   │       └── summary/route.js    # GET (monthly summary)
│   │   ├── favicon.ico
│   │   ├── globals.css                 # Tailwind import
│   │   ├── layout.js                   # Root layout + metadata
│   │   └── page.js                     # Main page (state + data fetching)
│   ├── components/
│   │   ├── ExpenseForm.jsx    # Create/edit form (controlled)
│   │   ├── ExpenseList.jsx    # List wrapper
│   │   ├── ExpenseItem.jsx    # Single row with edit/delete
│   │   ├── CategoryFilter.jsx # Filter dropdown
│   │   └── SummaryPanel.jsx   # Monthly total + per-category breakdown
│   └── lib/
│       ├── constants.js       # CATEGORIES array + validation helpers
│       └── db.js              # Prisma singleton (globalThis cache)
├── .env                       # DATABASE_URL (gitignored)
├── .gitignore
├── jsconfig.json              # @/* path alias → ./src/*
├── next.config.mjs
├── package.json
└── postcss.config.mjs
```

## 4. Database Schema

**Table: `expenses`** (mapped via `@@map("expenses")`)

| Column     | Prisma Type | DB Column   | Notes                                      |
|------------|-------------|-------------|--------------------------------------------|
| id         | Int         | id          | `@id @default(autoincrement())`            |
| amount     | Float       | amount      | Required, positive number                  |
| category   | String      | category    | One of: Food, Transport, Bills, Entertainment, Other |
| note       | String?     | note        | Optional, can be NULL                      |
| date       | String      | date        | Format `YYYY-MM-DD`, defaults to today     |
| createdAt  | String      | created_at  | Auto-set ISO timestamp (`@map("created_at")`) |

Sort order: `date` descending, then `createdAt` descending (newest first).

## 5. Categories (Fixed List)

```js
["Food", "Transport", "Bills", "Entertainment", "Other"]
```
Defined in `src/lib/constants.js`. Used for: form dropdown, filter dropdown, and summary breakdown.

## 6. API Contract

Base URL: `/api` (same-origin, no CORS needed)

### `POST /api/expenses`
Create a new expense.

**Request body:**
```json
{
  "amount": 25.50,
  "category": "Food",
  "note": "Lunch with team",
  "date": "2026-06-12"
}
```
- `note` is optional (can be omitted or `null`).

**Response (201):**
```json
{
  "id": 1,
  "amount": 25.50,
  "category": "Food",
  "note": "Lunch with team",
  "date": "2026-06-12",
  "createdAt": "2026-06-12T14:30:00.000Z",
  "created_at": "2026-06-12T14:30:00.000Z"
}
```

### `GET /api/expenses`
List all expenses, newest first.

**Query params (optional):**
- `category` — filter by one of the fixed categories

**Response (200):** array of expense objects.

### `PUT /api/expenses/{id}`
Update an existing expense. All fields required (same validation as create).

**Response (200):** updated expense object.

### `DELETE /api/expenses/{id}`
Delete an expense by ID.

**Response (200):**
```json
{ "message": "Expense deleted", "id": 1 }
```

### `GET /api/expenses/summary`
Returns total spent this month, and total per category (current month only).

**Response (200):**
```json
{
  "month_total": 540.75,
  "by_category": {
    "Food": 200.00,
    "Transport": 100.50,
    "Bills": 150.25,
    "Entertainment": 50.00,
    "Other": 40.00
  }
}
```

> **Route ordering note:** `summary/route.js` must exist as a sibling of `[id]/route.js` so Next.js matches `/api/expenses/summary` before the dynamic `[id]` segment.

## 7. Frontend Pages/Layout

Single-page app at `/` (`src/app/page.js`, `"use client"`):
- **Header:** App title
- **Left/Top section:** `ExpenseForm` — add or edit expense (amount, category dropdown, note, date picker defaulting to today)
- **Filter bar:** `CategoryFilter` — dropdown to filter the list by category (including "All")
- **Main list:** `ExpenseList` → renders `ExpenseItem` rows with edit and delete buttons (delete has confirm step)
- **Sidebar/Bottom:** `SummaryPanel` — shows month total + per-category breakdown as a clean text/bar list

## 8. Validation Rules

Defined in `src/lib/constants.js`:

- `amount`: must be a positive number (> 0)
- `category`: must be one of the 5 fixed categories
- `date`: must match `YYYY-MM-DD` regex
- `note`: optional, trimmed, can be NULL

## 9. Key Architectural Decisions

| Decision | Reasoning |
|----------|-----------|
| Next.js App Router | Single codebase, SSR support, Vercel-native |
| PostgreSQL over SQLite | SQLite incompatible with Vercel serverless (no persistent filesystem) |
| Prisma v7 + `prisma-client-js` | Type-safe queries, migrations, easy Vercel integration |
| `@prisma/adapter-pg` driver adapter | Prisma v7 requires explicit adapter for direct DB connections |
| Prisma singleton via `globalThis` | Prevents multiple client instances during dev hot-reload |
| `"use client"` on all interactive components | Required for React state/hooks in Next.js App Router |
| Relative `/api` URLs | Same-origin eliminates CORS entirely |
| No TypeScript | Kept simple for a demo project |

## 10. Prisma v7 Configuration

- **`prisma/schema.prisma`**: uses `prisma-client-js` generator, NO `url` in datasource block (Prisma v7 forbids it)
- **`prisma.config.ts`**: provides `datasource.url` from `process.env.DATABASE_URL` for migrations only
- **`src/lib/db.js`**: instantiates `PrismaClient` with `new PrismaPg({ connectionString: process.env.DATABASE_URL })` adapter
- **`.env`**: stores `DATABASE_URL` (gitignored)

## 11. Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npx prisma generate` | Regenerate Prisma client (run after schema changes) |
| `npx prisma db push` | Sync schema to database without migrations |
| `npx prisma studio` | Visual database browser |

## 12. Deployment (Vercel)

1. Push repo to GitHub
2. Import project on vercel.com
3. Add Vercel Postgres (or Neon) from Vercel dashboard
4. `DATABASE_URL` is auto-injected as an environment variable
5. Run `npx prisma db push` once via Vercel CLI or CI to create the table
6. All subsequent deploys auto-run `next build`

## 13. Notes / Open Items

- No authentication, no user accounts — single shared dataset.
- App runs as a single Next.js server (no separate backend process).
- CORS is not needed — frontend and API share the same origin.
- `prisma generate` must run before `npm run build` (Vercel handles this via postinstall).
- `@vercel/postgres` is installed but deprecated in favor of the Neon SDK — not actively used since Prisma handles the connection.
