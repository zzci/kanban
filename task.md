# Kanban App — Task List

> Updated: 2026-02-23 15:00

## Usage

### Task Format

- [ ] **PREFIX-001 Short imperative title** `P1`
  - description: What to do, context, and acceptance criteria
  - activeForm: Present-continuous spinner text
  - createdAt: YYYY-MM-DD HH:mm
  - blocked by: Prerequisite tasks (optional)
  - blocks: Downstream tasks (optional)
  - owner: Assignee (optional)

### Task ID

- Format: `PREFIX-NNN` — uppercase category prefix + sequential number.
- Examples: `AUTH-001`, `UI-002`, `API-003`, `BUG-001`, `PERF-001`.
- IDs are stable once assigned; never reuse or renumber.

### Status Markers

| Marker | Meaning |
|--------|---------|
| `[ ]`  | Pending |
| `[-]`  | In progress |
| `[x]`  | Completed |
| `[~]`  | Closed / Won't do |

### Priority Levels

| Tag  | Meaning |
|------|---------|
| `P0` | Blocking issue, handle immediately |
| `P1` | High priority, current iteration |
| `P2` | Medium priority, next iteration |
| `P3` | Low priority, to be planned |

### Update Rules

- **Only update the checkbox marker** (e.g. `[ ]` → `[x]`); **never delete description, sub-fields, or any other information**.
- Update status markers in place; do not move tasks between sections.
- Completed tasks: change marker to `[x]`, keep all sub-fields intact.
- Closed tasks: change marker to `[~]`, add a one-line reason in description if needed, keep all existing sub-fields.
- New tasks append to the end of the list.

---

## Tasks

- [x] **UI-001 Create project dashboard as default page** `P1`
  - description: Replace the health-check HomePage with a project dashboard that displays all projects as cards with issue/status counts. Change `/` route to show dashboard instead of redirecting to `/projects/default`.
  - activeForm: Creating project dashboard
  - createdAt: 2026-02-22 23:00

- [x] **UI-002 Add distinctive typography** `P2`
  - description: Replace system font stack with a distinctive font pairing. Use a geometric sans (e.g. DM Sans, Satoshi) for body and a monospace (e.g. JetBrains Mono) for issue IDs and code. System fonts make the app look like every other shadcn project.
  - activeForm: Adding custom typography
  - createdAt: 2026-02-23 04:30

- [x] **UI-003 Unify light/dark theme identity** `P2`
  - description: Light theme is corporate-bland grays, dark theme has atmospheric green-tinted OKLCH palette — they feel like two different apps. Bring the dark theme's hue into the light theme as subtle tints to create a cohesive brand identity.
  - activeForm: Unifying theme identity
  - createdAt: 2026-02-23 04:30

- [x] **UI-004 Commit to border-radius decision** `P2`
  - description: Global `--radius: 0` suggests a brutalist/sharp direction, but components use `rounded-lg`, `rounded-xl`, `rounded-md` everywhere, contradicting the design intent. Either enforce sharp corners on all components (buttons, cards, badges, inputs) or remove the global override.
  - activeForm: Fixing border-radius inconsistency
  - createdAt: 2026-02-23 04:30

- [x] **UI-005 Add page and card entry animations** `P3`
  - description: App feels static and lifeless. Add staggered fade-slide-in animations for kanban cards on load, page/route transition animations, and scroll-triggered effects where appropriate. Use tw-animate-css or add a motion library.
  - activeForm: Adding entry animations
  - createdAt: 2026-02-23 04:30

- [x] **UI-006 Enhance drag-and-drop visual feedback** `P3`
  - description: Dragged kanban card only changes to `opacity-40` which feels cheap. Add scale transform, elevated shadow, subtle rotation on the dragged card. Drop zones should pulse or highlight more dramatically with ring/glow effects.
  - activeForm: Enhancing drag-and-drop feedback
  - createdAt: 2026-02-23 04:30

- [x] **UI-007 Add background texture and depth** `P3`
  - description: All surfaces are flat solid colors with no visual depth. Add subtle noise texture overlay or gradient mesh on backgrounds to create atmosphere without being distracting. Matches the dark theme's moody aesthetic.
  - activeForm: Adding background texture
  - createdAt: 2026-02-23 04:30

- [x] **BUG-001 Fix mobile chat input send button clipped** `P1`
  - description: On mobile (iOS Safari), the send button ("发") in ChatInput is clipped/cut off on the right edge. The chat input card overflows the viewport width. Check ChatInput.tsx toolbar layout — the `justify-between` with `px-2.5` plus outer `px-3` may not leave enough room. Ensure the chat input card respects `max-w-full` and `overflow-hidden` on mobile.
  - activeForm: Fixing send button clipping
  - createdAt: 2026-02-23 05:00

- [x] **BUG-002 Fix mysterious horizontal line in chat toolbar** `P1`
  - description: On mobile, a long horizontal line appears between the paperclip/attach button and the send button in the ChatInput toolbar. This line should not exist. Investigate whether it's a border artifact, an unstyled element, or a rendering issue. See screenshot at tmp/deta.jpeg.
  - activeForm: Fixing toolbar line artifact
  - createdAt: 2026-02-23 05:00

- [x] **BUG-003 Fix empty white space above chat input on mobile keyboard** `P1`
  - description: When the mobile keyboard opens on the issue detail page, there is a large empty white area above the chat input where the issue detail content should be visible. The content area either isn't rendering or the scroll position isn't adjusting when the keyboard appears. Check ChatArea.tsx and IssueDetailPage.tsx for proper mobile viewport handling with `h-dvh` and keyboard-aware layout.
  - activeForm: Fixing mobile keyboard layout
  - createdAt: 2026-02-23 05:00

- [x] **UI-008 Mobile: navigate to issue detail page instead of IssuePanel** `P1`
  - description: On mobile, clicking a kanban card currently opens the IssuePanel side panel, which is cramped and not optimized for small screens. Instead, on mobile devices, tapping a card should navigate directly to the issue detail page (`/projects/:projectId/issues/:issueId`) for a full-screen experience. Keep the IssuePanel behavior on desktop. Update KanbanCard click handler and KanbanPage to check `useIsMobile()` and use `navigate()` instead of opening the panel.
  - activeForm: Implementing mobile issue navigation
  - createdAt: 2026-02-23 05:15

- [x] **BUG-004 Mobile: project settings modal too large** `P1`
  - description: On mobile, the project settings modal is too large and overflows the viewport. Resize it to match the smaller dimensions used by the create issue dialog. Ensure the modal content is scrollable and fits comfortably on small screens.
  - activeForm: Resizing project settings modal for mobile
  - createdAt: 2026-02-23 06:00

- [x] **UI-009 Mobile: replace Home link with Kanban link to homepage** `P1`
  - description: On mobile, remove the dedicated Home nav link. Instead, make the Kanban logo/text link navigate to the homepage (`/dashboard`). This simplifies the mobile navigation by reducing clutter while keeping the homepage accessible via the branding link.
  - activeForm: Updating mobile nav links
  - createdAt: 2026-02-23 06:00

- [x] **UI-010 Mobile: simplify right drawer menu** `P1`
  - description: On mobile, the right-side drawer contains too many items. Remove the "Menu" title header and strip down to only three items: New Project button, Language switcher, and Theme toggle. Remove all other navigation or action items from the mobile drawer to keep it clean and focused.
  - activeForm: Simplifying mobile right drawer
  - createdAt: 2026-02-23 06:00

- [x] **UI-011 Add kanban/list view mode switcher** `P1`
  - description: The app currently has two view modes — kanban board and issue list — but no way to toggle between them on the same page. Add a view mode switcher (e.g. toggle button group with Kanban/List icons) to the project header so users can switch between kanban board view and list view without changing routes. Persist the selected mode preference.
  - activeForm: Adding view mode switcher
  - createdAt: 2026-02-23 06:00

- [x] **UI-012 Add dark theme logo** `P1`
  - description: The app currently uses a single logo that doesn't adapt to dark theme. Add a dark-theme variant of the logo that displays automatically when dark mode is active. Use CSS media query, class-based switching, or the theme context to swap between light and dark logo assets.
  - activeForm: Adding dark theme logo
  - createdAt: 2026-02-23 06:00

- [x] **BUG-005 Mobile: create project modal too large** `P1`
  - description: On mobile, the create project modal is too large and overflows the viewport. Apply the same responsive sizing used in BUG-004 for the project settings modal — add `max-w-[calc(100%-2rem)]` and ensure content is scrollable on small screens.
  - activeForm: Resizing create project modal for mobile
  - createdAt: 2026-02-23 07:00

- [x] **UI-013 Add worktree option when creating issues** `P1`
  - description: When creating a new issue, add an option (e.g. toggle or checkbox) to specify whether a git worktree should be created for the issue. This lets users choose between working in the main repo or an isolated worktree per issue. Store the worktree preference on the issue and display it in the issue detail view.
  - activeForm: Adding worktree option to issue creation
  - createdAt: 2026-02-23 07:30

- [x] **AGENT-001 Design agent system database schema** `P0`
  - description: Extend Drizzle ORM schema (`app/db/schema.ts`) with tables for the AI agent execution system. Tables needed: `agentProfiles` (agent type, binary path, protocol, capabilities, config), `agentSessions` (project-scoped session lifecycle, status, agent profile ref), `executionProcesses` (individual process runs, pid, exit code, started/finished timestamps), `executionLogs` (normalized log entries linked to execution process). Use existing `commonFields` pattern. Generate Drizzle migration.
  - activeForm: Designing agent database schema
  - createdAt: 2026-02-23 09:00

- [x] **AGENT-002 Define core TypeScript types and interfaces** `P0`
  - description: Create `app/agents/types.ts` with core types: `AgentType` enum (ClaudeCode, Codex, Gemini, Cursor, Amp, Copilot, Qwen, Droid, Opencode), `AgentProtocol` enum (StreamJson, JsonRpc, Acp, ControlProtocol, HttpSdk), `AgentCapability` flags (SessionFork, SetupHelper, ContextUsage, PlanMode), `SpawnOptions` (workDir, prompt, env vars, model, permissions), `SpawnedProcess` (subprocess ref, sessionId, cancelToken), `NormalizedLogEntry` (timestamp, type, content, metadata), `ExecutorConfig` (agent type, variant, model, permissions), `AgentAvailability` (installed, version, authStatus). Follow the Rust trait patterns but adapted to TypeScript interfaces.
  - activeForm: Defining agent type system
  - createdAt: 2026-02-23 09:00
  - blocked by: none

- [x] **AGENT-003 Implement CLI agent discovery** `P0`
  - description: Create `app/agents/discovery.ts` that detects which AI coding agents are installed and available. For each agent type, check binary existence (e.g. `which claude`, `npx @anthropic-ai/claude-code --version`), parse version, detect auth status (e.g. check `~/.claude.json` for Claude, `~/.gemini/oauth_creds.json` for Gemini, `~/.codex/` for Codex). Return `AgentAvailability[]` with install status, version, and authentication state. Use `Bun.spawn` for detection commands. Cache results with TTL.
  - activeForm: Implementing CLI agent discovery
  - createdAt: 2026-02-23 09:00
  - blocked by: AGENT-002

- [x] **AGENT-004 Implement command builder utility** `P1`
  - description: Create `app/agents/command.ts` with a fluent command builder for constructing agent CLI invocations. Support base command, params, env vars, shell param extensions, and command overrides. Handle both NPX-based (`npx -y @anthropic-ai/claude-code@latest`) and native binary (`cursor-agent`) launch patterns. Include `resolveExecutable()` to find the actual binary path. Translate the Rust `CommandBuilder` pattern to TypeScript.
  - activeForm: Building command builder utility
  - createdAt: 2026-02-23 09:00
  - blocked by: AGENT-002

- [x] **AGENT-005 Implement base executor interface and Claude Code executor** `P1`
  - description: Create `app/agents/executor.ts` with base `AgentExecutor` interface (spawn, spawnFollowUp, spawnReview, cancel, getAvailability, normalizeLog). Create `app/agents/executors/claude.ts` implementing Claude Code executor. Use `Bun.spawn` with stdin/stdout piped. Handle CLI args (`-p --output-format=stream-json --verbose`), model selection, permission modes (bypass/plan/default), session resume (`--resume`), and the stream-json output parsing. This is the primary executor — others will follow the same pattern.
  - activeForm: Implementing Claude Code executor
  - createdAt: 2026-02-23 09:00
  - blocked by: AGENT-002, AGENT-004

- [x] **AGENT-006 Implement log normalization system** `P1`
  - description: Create `app/agents/logs.ts` with log normalization that converts agent-specific output formats into unified `NormalizedLogEntry` records. For Claude Code stream-json: parse JSONL lines, handle `assistant`, `tool_use`, `tool_result`, `error`, `system` message types. Map tool calls to `ActionType` categories (FileRead, FileEdit, CommandRun, Search, etc.). Support streaming via async iterators. Include a `PlainTextProcessor` fallback for agents without structured output.
  - activeForm: Implementing log normalization
  - createdAt: 2026-02-23 09:00
  - blocked by: AGENT-002, AGENT-005

- [x] **AGENT-007 Implement session management and API routes** `P1`
  - description: Create `app/routes/agents.ts` with API routes for agent management: `GET /api/agents/available` (list detected agents), `POST /api/projects/:projectId/sessions` (create agent session), `POST /api/projects/:projectId/sessions/:id/execute` (spawn/follow-up agent), `POST /api/projects/:projectId/sessions/:id/cancel` (cancel running process), `GET /api/projects/:projectId/sessions/:id/logs` (get normalized logs). Create `app/agents/session-manager.ts` for session lifecycle. Integrate with memory-store initially, with DB persistence ready.
  - activeForm: Building session management routes
  - createdAt: 2026-02-23 09:00
  - blocked by: AGENT-001, AGENT-005, AGENT-006

- [x] **AGENT-008 Implement process lifecycle manager** `P1`
  - description: Create `app/agents/process-manager.ts` that manages spawned agent processes. Track active processes in memory (Map by execution ID). Handle process start, monitor stdout/stderr streams, detect completion/errors, enforce timeouts, support graceful cancellation (SIGTERM then SIGKILL). Emit events for process state changes. Implement cleanup on server shutdown. Use Bun's `subprocess.exited` promise and `subprocess.kill()` APIs.
  - activeForm: Implementing process lifecycle manager
  - createdAt: 2026-02-23 09:00
  - blocked by: AGENT-002, AGENT-005

- [x] **AGENT-009 Split executors per agent and add model fields** `P1`
  - description: Refactor agent system to only support Claude Code, Codex, and Gemini. Split executors into individual files per agent (`executors/claude.ts`, `executors/codex.ts`, `executors/gemini.ts`) with a central registry (`executors/index.ts`). Reduce `AgentType` to 3 values. Add `AgentModel` interface and `availableModels` field to `AgentProfile`. Codex and Gemini executors are stubs with TODO markers. Update session-manager to use the registry instead of hardcoded executor map. Clean up `DETECTION_CONFIG` and `BUILT_IN_PROFILES` to only include the 3 supported agents.
  - activeForm: Splitting executor per agent
  - createdAt: 2026-02-23 14:00
  - blocked by: AGENT-005

- [x] **SEC-001 Add authentication middleware to all API routes** `P0`
  - description: No route has authentication. Any HTTP client can CRUD projects/issues, execute AI agents, and browse the filesystem. Add API key or JWT middleware gating all `/api/*` routes. At minimum support `Authorization: Bearer <token>` with a server-side secret from env var.
  - activeForm: Adding authentication middleware
  - createdAt: 2026-02-23 14:30
  - blocks: SEC-002, SEC-003, SEC-004

- [x] **SEC-002 Restrict filesystem endpoint to allowed roots** `P0`
  - description: `/api/filesystem/dirs` accepts arbitrary `path` query param — `?path=/etc` enumerates the whole server. Validate that resolved path starts with an allowed root (e.g. `process.cwd()` or `PROJECTS_ROOT` env var). Return 403 for paths outside the allowlist. Location: `app/routes/filesystem.ts`.
  - activeForm: Restricting filesystem endpoint
  - createdAt: 2026-02-23 14:30

- [x] **SEC-003 Remove hardcoded dangerouslySkipPermissions and validate workingDir** `P0`
  - description: `session-manager.ts` hardcodes `permissionMode:'bypass'` and `dangerouslySkipPermissions:true` for all agent executions. User-supplied `workingDir` is passed directly to subprocess with no validation. Fix: respect agent profile's `permissionPolicy`, validate `workingDir` against project directory allowlist, never default to skip-permissions. Location: `app/agents/session-manager.ts:54-55,124-125`, `app/routes/sessions.ts:34`.
  - activeForm: Fixing permission bypass and workingDir validation
  - createdAt: 2026-02-23 14:30

- [x] **SEC-004 Remove or restrict /api/runtime endpoint** `P0`
  - description: `/api/runtime` exposes `process.argv`, `execPath`, `cwd`, `pid`, env vars — aids attacker fingerprinting. Either remove entirely, gate behind auth + NODE_ENV=development check, or strip sensitive fields (argv, execPath). Location: `app/routes/api.ts:67-100`.
  - activeForm: Restricting runtime info endpoint
  - createdAt: 2026-02-23 14:30

- [x] **SEC-005 Add security headers, CORS, and rate limiting** `P1`
  - description: No security headers (CSP, X-Frame-Options, HSTS, nosniff), no CORS config, no rate limiting. Add `hono/secure-headers` middleware, explicit CORS via `hono/cors` scoped to allowed origins, and rate limiting on session/execute endpoints (e.g. 10 req/min). Location: `app/app.ts`.
  - activeForm: Adding security headers and rate limiting
  - createdAt: 2026-02-23 14:30

- [x] **API-001 Add Zod input validation on all API routes** `P1`
  - description: All POST/PATCH routes use `c.req.json<T>()` which is compile-time only — zero runtime validation. `as any` cast on agentType, `as 'urgent'|...` cast on priority. Add `@hono/zod-validator` with schemas for every route. Validate enums (priority, agentType), string lengths (title ≤500, prompt ≤32KB), and required fields. Affected: all files in `app/routes/`.
  - activeForm: Adding Zod validation to routes
  - createdAt: 2026-02-23 14:30

- [x] **API-002 Add global error handler and fix JSON parse crashes** `P1`
  - description: Malformed JSON body crashes handlers (no try/catch around `c.req.json()`). No global error handler — stack traces may leak in dev. Add `app.onError()` in `app.ts` returning standardized `{success:false, error}` envelope. Log errors via winston. Also fix inconsistent envelope on 404, health, runtime endpoints.
  - activeForm: Adding global error handler
  - createdAt: 2026-02-23 14:30

- [x] **API-003 Add cross-project ownership checks on all data operations** `P1`
  - description: `getIssue()` ignores projectId — issues accessible across projects. Same for tags (cross-project assignment) and bulk update (operates on any project's issues). Fix: verify `issue.projectId === routeProjectId` in GET/PATCH single issue, verify tag+issue belong to project before assignment, filter bulk update IDs by project. Also add project existence middleware for all `/api/projects/:projectId/*` routes. Affected: `routes/issues.ts`, `routes/tags.ts`, `db/memory-store.ts`.
  - activeForm: Adding project ownership checks
  - createdAt: 2026-02-23 14:30

- [x] **API-004 Fix ProcessManager memory leak** `P2`
  - description: `ProcessManager.processes` map grows indefinitely — no cleanup for finished processes. `onStateChange`/`onLog` callbacks accumulate per execution (registered in session-manager, never unregistered). Fix: add TTL-based cleanup for completed processes, return unsubscribe functions from `onStateChange`/`onLog`, clean up on execution completion. Also fix conflicting SIGINT/SIGTERM handlers between `index.ts` and `process-manager.ts`. Location: `app/agents/process-manager.ts`, `app/agents/session-manager.ts`.
  - activeForm: Fixing process manager memory leak
  - createdAt: 2026-02-23 14:30

- [x] **FE-001 Fix TypeScript error in dnd-kit drag handler** `P1`
  - description: `DragEvent` type in board-store is derived from `onDragOver` but used for `onDragEnd` which has additional `cancelable`/`preventDefault` properties. TS2345 error blocks `tsc --noEmit`. Fix: define separate event types or use a more general type. Location: `frontend/src/stores/board-store.ts:6-8`, `frontend/src/components/kanban/KanbanBoard.tsx:73`.
  - activeForm: Fixing dnd-kit type error
  - createdAt: 2026-02-23 14:30

- [x] **FE-002 Fix missing i18n keys and hardcoded English strings** `P1`
  - description: Missing key `viewMode.switchView` in both en.json and zh.json (used in AppSidebar:280). Hardcoded "Kanban" and "List" strings in HomePage, AppSidebar, KanbanHeader bypass i18n. Add missing keys to both translation files and replace hardcoded strings with `t()` calls.
  - activeForm: Fixing i18n gaps
  - createdAt: 2026-02-23 14:30

- [x] **FE-003 Normalize query keys and add enabled guards** `P1`
  - description: Query keys inconsistent — `['issues', projectId]` vs `['projects', projectId, 'issues', issueId]` breaks cache invalidation. `['project', pid]` (singular) vs `['projects']` (plural). Hooks fire with empty projectId (no `enabled` guard). Fix: create `queryKeys` factory with hierarchical keys, add `enabled: !!projectId` to all hooks. Location: `frontend/src/hooks/use-kanban.ts`.
  - activeForm: Normalizing query keys
  - createdAt: 2026-02-23 14:30

- [x] **FE-004 Extract shared utilities and eliminate duplication** `P1`
  - description: Duplicated across 2-3+ files each: `getProjectInitials` (HomePage, AppSidebar, MobileSidebar), `formatSize` (CreateIssueDialog, FilePreviewDialog), `LANGUAGES` constant (3 files), click-outside pattern (8+ components — only CreateIssueDialog has a hook, not exported). Extract `useClickOutside` to `hooks/use-click-outside.ts`, utilities to `lib/format.ts`, constants to `lib/constants.ts`.
  - activeForm: Extracting shared utilities
  - createdAt: 2026-02-23 14:30

- [x] **FE-005 Refactor ReviewDialog to use Radix Dialog primitive** `P1`
  - description: ReviewDialog builds custom overlay, escape-key, click-outside from scratch. Missing focus trap, aria-modal, role="dialog". Replace with existing `<Dialog>/<DialogContent>` components from `components/ui/dialog.tsx` which wraps Radix UI with proper accessibility. Location: `frontend/src/components/issue-detail/ReviewDialog.tsx`.
  - activeForm: Refactoring ReviewDialog
  - createdAt: 2026-02-23 14:30

- [ ] **ARCH-001 Introduce repository interface for data layer** `P2`
  - description: Memory store and Drizzle ORM have no shared interface — migration will require rewriting every route handler. Create `app/db/repository.ts` with interfaces (IssueRepository, ProjectRepository, etc.) that both memory-store and future Drizzle implementation satisfy. Route handlers import from repository, not memory-store directly. Also add Drizzle schema for kanban entities (projects, issues, statuses, tags).
  - activeForm: Creating repository abstraction
  - createdAt: 2026-02-23 14:30

- [x] **ARCH-002 Add Suspense fallback and ErrorBoundary** `P2`
  - description: `Suspense` in main.tsx has no `fallback` — blank screen during lazy load. No `ErrorBoundary` anywhere — runtime errors show blank screen. Add loading spinner fallback to Suspense, add React ErrorBoundary wrapping routes. Location: `frontend/src/main.tsx`.
  - activeForm: Adding Suspense fallback and ErrorBoundary
  - createdAt: 2026-02-23 14:30

- [x] **ARCH-003 Configure QueryClient default options** `P2`
  - description: QueryClient created with no defaults — `staleTime:0` causes refetch on every mount, `retry:3` is aggressive for in-memory backend. Set sensible defaults: `staleTime:30s`, `retry:1`. Location: `frontend/src/main.tsx:13`.
  - activeForm: Configuring QueryClient defaults
  - createdAt: 2026-02-23 14:30

- [x] **CLEAN-001 Deduplicate backend code** `P3`
  - description: `classifyCommand` duplicated in `agents/logs.ts` and `agents/executors/claude.ts`. `DEFAULT_STATUSES` defined twice in memory-store. Seed data (~400 lines) embedded in store module. Fix: single export from logs.ts, extract DEFAULT_STATUSES constant, move seed data to `app/db/seed-data.ts`.
  - activeForm: Deduplicating backend code
  - createdAt: 2026-02-23 14:30

- [x] **CLEAN-002 Fix inconsistent priority icons** `P3`
  - description: PriorityIcon maps urgent→Flame, high→AlertTriangle, medium→ArrowUp. IssueDetail maps urgent→AlertTriangle, high→ArrowUp, medium→Minus. Users see different icons for same priority between kanban board and detail page. Fix: use PriorityIcon component in IssueDetail.tsx. Location: `frontend/src/components/kanban/PriorityIcon.tsx`, `frontend/src/components/issue-detail/IssueDetail.tsx`.
  - activeForm: Fixing priority icon inconsistency
  - createdAt: 2026-02-23 14:30

- [x] **CLEAN-003 Fix board-store magic timeout and wire ChatInput** `P3`
  - description: board-store uses arbitrary 500ms `setTimeout` to reset `isDragging` — should be tied to mutation `onSettled`. ChatInput send button has no `onClick` handler (stub). Fix: reset isDragging in `onSettled` callback, either wire send handler or visually mark chat as "coming soon". Location: `frontend/src/stores/board-store.ts:59`, `frontend/src/components/issue-detail/ChatInput.tsx:191`.
