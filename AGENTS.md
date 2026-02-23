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

#### Data Layer (Important)

The backend has two data backends — **only the in-memory store is wired up to routes currently**:

- `app/db/memory-store.ts` — In-memory store with seed data for 4 demo projects (each with statuses, issues, tags). All route handlers (`app/routes/*.ts`) import from here. Data resets on server restart.
- `app/db/index.ts` + `app/db/schema.ts` — SQLite/Drizzle ORM setup (exists but not used by routes yet). The `runtimeEvents` table is the only schema defined so far.

When adding new features, use the memory store pattern unless migrating to persistent storage.

#### API Routes

All routes are project-scoped under `/api/projects/:projectId/...`:

```
GET/POST       /api/projects
GET/PATCH      /api/projects/:projectId
GET            /api/projects/:projectId/statuses
GET/POST       /api/projects/:projectId/issues
PATCH          /api/projects/:projectId/issues/bulk
GET/PATCH      /api/projects/:projectId/issues/:id
GET            /api/projects/:projectId/tags
POST/DELETE    /api/projects/:projectId/issues/:issueId/tags/:tagId
```

All API responses use the envelope `{ success: true, data: T } | { success: false, error: string }`.

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

- **TanStack React Query** — Server state (projects, issues, statuses, tags). All hooks in `frontend/src/hooks/use-kanban.ts`. Query keys follow `['entity', projectId]` pattern. The `useBulkUpdateIssues` hook uses optimistic updates.
- **Zustand stores** — Local UI state only:
  - `board-store.ts` — Drag-and-drop state (`groupedItems`, `isDragging`). Syncs from server data but pauses sync while dragging.
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

#### Frontend Routes

```
/                                    → redirects to /projects/default
/projects/:projectId                 → KanbanPage (board view)
/projects/:projectId/issues          → IssueDetailPage (list + chat)
/projects/:projectId/issues/:issueId → IssueDetailPage (specific issue)
/dashboard                           → HomePage
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

## Project Task

Use the /ptask skill to manage all tasks.
- Read `task.md` before starting work; create one if it does not exist.
- Every change, new feature, or bug fix must have a corresponding entry in `task.md`.
- Task IDs use `PREFIX-NNN` format (e.g. `AUTH-001`); never skip or reuse IDs.
- Update status markers in place after completing a task.
