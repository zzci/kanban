# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kanban app with a Bun/Hono API backend and a React/Vite frontend. The two halves live in separate dependency trees (root `package.json` for the backend, `frontend/package.json` for the frontend).

## Commands

```bash
# Backend
bun install                  # install backend deps
bun run dev:api              # start API server (port 3000)
bun run lint                 # eslint (backend only, @antfu/eslint-config)
bun run lint:fix             # eslint --fix
bun run format               # prettier --write
bun run format:check         # prettier --check

# Frontend (runs inside frontend/)
bun install --cwd frontend   # install frontend deps
bun run dev                  # vite dev server (port 3000, proxies /api to Hono)
bun run build                # vite build -> frontend/dist/
bun run --cwd frontend test  # vitest (all frontend tests)
bun run --cwd frontend test -- path/to/file  # run a single test file
bun run --cwd frontend lint  # eslint (frontend, @tanstack/eslint-config)

# Database
bun run db:generate          # drizzle-kit generate (creates migration SQL)
bun run db:migrate           # drizzle-kit migrate (applies migrations)
bun run db:reset             # deletes SQLite DB files (data/kanban.db)
```

## Architecture

### Backend (`app/`)

- **Runtime**: Bun with `Bun.serve()` as the HTTP server
- **Router**: Hono — mounted at `/api` via `app/app.ts`
- **Database**: SQLite via `bun:sqlite` + Drizzle ORM (`app/db/`)
  - Schema defined in `app/db/schema.ts` using Drizzle's `sqliteTable`
  - All tables share `commonFields` (ULID `id`, `createdAt`, `updatedAt`, `isDeleted`)
  - Migrations live in `drizzle/` and run automatically on startup
  - Config: `drizzle.config.ts`
- **Logging**: winston (`app/logger.ts`)
- **Static serving**: In production, `app/index.ts` serves `frontend/dist/` with SPA fallback

#### Security & Middleware (`app/app.ts`)

- **Auth**: `Authorization: Bearer <token>` middleware gated by `API_SECRET` env var. If unset (dev mode), all requests pass. Health endpoint exempt.
- **Security headers**: `hono/secure-headers` (X-Frame-Options, X-Content-Type-Options, etc.)
- **CORS**: `hono/cors` with `ALLOWED_ORIGIN` env var (defaults to `*`)
- **Rate limiting**: In-memory limiter on session execute endpoint (10 req/min per IP)
- **Global error handler**: `app.onError()` returns `{success: false, error}` envelope; logs via winston
- **Input validation**: All POST/PATCH routes use `@hono/zod-validator` with Zod schemas for runtime type checking

#### Data Layer (Important)

The backend has two data backends — **only the in-memory store is wired up to routes currently**:

- `app/db/memory-store.ts` — In-memory store with cross-project ownership validation. All route handlers import from here. Data resets on server restart.
- `app/db/seed-data.ts` — Seed data for 4 demo projects (statuses, issues, tags) and `DEFAULT_STATUSES` constant, extracted from memory-store.
- `app/db/index.ts` + `app/db/schema.ts` — SQLite/Drizzle ORM setup (exists but not used by routes yet). The `runtimeEvents` table is the only schema defined so far.

When adding new features, use the memory store pattern unless migrating to persistent storage.

#### API Routes

All routes are project-scoped under `/api/projects/:projectId/...`:

```
GET/POST       /api/projects
GET/PATCH      /api/projects/:projectId
GET/POST       /api/projects/:projectId/statuses
PATCH          /api/projects/:projectId/statuses/:id
GET/POST       /api/projects/:projectId/issues
PATCH          /api/projects/:projectId/issues/bulk
GET/PATCH      /api/projects/:projectId/issues/:id
GET/POST       /api/projects/:projectId/tags
DELETE         /api/projects/:projectId/tags/:tagId
POST/DELETE    /api/projects/:projectId/issues/:issueId/tags/:tagId
POST           /api/projects/:projectId/sessions
POST           /api/projects/:projectId/sessions/:id/execute
POST           /api/projects/:projectId/sessions/:id/follow-up
POST           /api/projects/:projectId/sessions/:id/cancel
GET            /api/projects/:projectId/sessions/:id/logs
```

All API responses use the envelope `{ success: true, data: T } | { success: false, error: string }`. All routes validate that the project exists and enforce cross-project ownership (issues, tags, statuses scoped to their project).

### Frontend (`frontend/`)

- **Framework**: React 19 + Vite 7 + TypeScript
- **Styling**: Tailwind CSS v4 via `@tailwindcss/vite` plugin
- **Routing**: react-router-dom v7
- **Data fetching**: TanStack React Query v5
- **Drag & drop**: @dnd-kit/react for kanban board
- **Dialogs**: Radix UI (`@radix-ui/react-dialog`)
- **Icons**: lucide-react
- **i18n**: i18next + react-i18next, Chinese (zh, default) and English (en). Translations in `frontend/src/i18n/{en,zh}.json`. Language persisted to localStorage (`i18n-lang`).
- **Path alias**: `@/*` maps to `frontend/src/*`
- **Dev proxy**: `@hono/vite-dev-server` proxies `/api/*` requests to the Hono app during `bun run dev`, so no separate backend process is needed for frontend dev

#### State Management

Two state systems, each with a distinct role:

- **TanStack React Query** — Server state (projects, issues, statuses, tags). All hooks in `frontend/src/hooks/use-kanban.ts`. Query keys use a `queryKeys` factory with hierarchical keys (e.g. `['projects', projectId, 'issues']`). All hooks have `enabled` guards. `useBulkUpdateIssues` uses optimistic updates. QueryClient defaults: `staleTime: 30s`, `retry: 1`.
- **Zustand stores** — Local UI state only:
  - `board-store.ts` — Drag-and-drop state (`groupedItems`, `isDragging`). Syncs from server data but pauses sync while dragging. Uses explicit `resetDragging()` tied to mutation `onSettled`.
  - `panel-store.ts` — Side panel and create dialog open/close state.
  - `view-mode-store.ts` — Kanban/list view toggle, persisted to localStorage (`kanban-view-mode`).

#### Component Areas

- `components/ui/` — shadcn/ui primitives (Button, Dialog, Badge, etc.)
- `components/kanban/` — Kanban board: columns, cards, sidebar, create issue dialog
- `components/issue-detail/` — Issue detail page: chat area, diff panel, issue list, review dialog

#### Component Styling

Components use the shadcn/ui pattern: `cn()` utility (`frontend/src/lib/utils.ts`) combining `clsx` + `tailwind-merge`, with `class-variance-authority` for component variants.

#### Theme

`useTheme()` hook (`frontend/src/hooks/use-theme.ts`) — supports `light`, `dark`, `system` modes, persisted to localStorage (`kanban-theme`).

#### Error Handling

- `ErrorBoundary` component wraps all routes in `main.tsx` — catches render errors with reload button
- `Suspense` with spinner fallback wraps lazy-loaded route components

#### Shared Utilities

- `frontend/src/hooks/use-click-outside.ts` — Shared click-outside hook (used by 5+ components)
- `frontend/src/lib/format.ts` — `formatSize()`, `getProjectInitials()`
- `frontend/src/lib/constants.ts` — `LANGUAGES` constant

#### Frontend Routes

```
/                                    → HomePage (project dashboard)
/projects/:projectId                 → KanbanPage (board view)
/projects/:projectId/issues          → IssueDetailPage (list + chat)
/projects/:projectId/issues/:issueId → IssueDetailPage (specific issue)
```

### Dev Workflow

- `bun run dev` (frontend Vite server) is the primary dev command — it serves both the React app and proxies API routes to Hono via `@hono/vite-dev-server`, eliminating the need to run `dev:api` separately
- `bun run dev:api` runs only the backend (useful for API-only work)
- Production: `bun run build` then `bun run start` — the Bun server handles both API and static file serving

## Conventions

- Use Bun APIs over Node.js equivalents (`Bun.file()`, `Bun.serve()`, `bun:sqlite`, `bun:test`)
- Backend eslint: `@antfu/eslint-config` — no semicolons, single quotes
- Frontend eslint: `@tanstack/eslint-config`
- Frontend tests use vitest + @testing-library/react (`bun run --cwd frontend test`)
- Backend tests use `bun test` with `bun:test`
- Bun auto-loads `.env` — do not use dotenv
- IDs use ULID (via `ulid` package), not UUID
- Frontend types mirror backend types in `frontend/src/types/kanban.ts`
- API client in `frontend/src/lib/kanban-api.ts` — add new endpoints here, then wrap in React Query hooks in `use-kanban.ts`
- All user-facing strings must have i18n keys in both `en.json` and `zh.json`
- All API routes must have Zod schemas via `@hono/zod-validator` — no `c.req.json<T>()` with compile-time-only types
- All route handlers must verify project existence and cross-project ownership before operating on scoped entities

## Project Task

Use the /ptask skill to manage all tasks.
- Read `task.md` before starting work; create one if it does not exist.
- Every change, new feature, or bug fix must have a corresponding entry in `task.md`.
- Task IDs use `PREFIX-NNN` format (e.g. `AUTH-001`); never skip or reuse IDs.
- **BEFORE starting any task**: immediately mark it `[-]` in `task.md` and set `owner` to your agent name. This is mandatory for multi-agent coordination.
- Update status markers in place after completing a task.
