# Kanban App — Task List

> Updated: 2026-02-22

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

