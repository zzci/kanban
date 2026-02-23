# Kanban App — Task List

> Updated: 2026-02-23

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
