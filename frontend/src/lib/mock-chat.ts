export type ChatMessageRole = 'user' | 'assistant' | 'system'

export type ChatMessage = {
  id: string
  role: ChatMessageRole
  content: string
  timestamp: string
  systemType?: 'hook_started' | 'hook_response' | 'model_init'
}

function seededRandom(seed: string): () => number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return () => {
    hash = (hash * 16807 + 0) % 2147483647
    return (hash & 0x7fffffff) / 0x7fffffff
  }
}

function offsetTime(base: string, minutesOffset: number): string {
  const d = new Date(base)
  d.setMinutes(d.getMinutes() + minutesOffset)
  return d.toISOString()
}

const ASSISTANT_TEMPLATES = [
  (title: string, desc: string | null, priority: string) =>
    `I'll analyze this issue and work on a solution.

**Issue:** ${title}
${desc ? `\n**Description:** ${desc}\n` : ''}
**Priority:** ${priority}

Let me start by examining the relevant code:

\`\`\`typescript
// Investigating the affected modules...
const issue = await findIssue({ title: "${title.slice(0, 30)}" });
const context = await gatherContext(issue);
\`\`\`

I've identified the key areas that need attention. Here's my approach:

1. **Root cause analysis** - Traced the issue through the codebase
2. **Implementation plan** - Identified the minimal changes needed
3. **Testing strategy** - Will verify the fix doesn't cause regressions

Working on the implementation now...`,

  (title: string, desc: string | null, priority: string) =>
    `Looking into this. Let me break down what needs to happen.

${desc ? `> ${desc}\n` : ''}

Based on my analysis, this is a **${priority}** priority task that involves:

- Reviewing the current implementation
- Identifying the specific changes needed
- Applying the fix with proper test coverage

\`\`\`bash
# Running diagnostics
bun test --filter "${title.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}"
\`\`\`

The changes are scoped and should not affect other areas of the codebase. I'll proceed with the implementation.`,

  (title: string, desc: string | null, _priority: string) =>
    `I've reviewed the codebase and have a clear understanding of what's needed.

**Task:** ${title}
${desc ? `\n${desc}\n` : ''}

Here's what I found:

\`\`\`typescript
// Key findings from code analysis
interface ChangeSet {
  files: string[];
  additions: number;
  deletions: number;
}

const changes: ChangeSet = {
  files: ["src/components/...", "src/lib/..."],
  additions: 42,
  deletions: 15,
};
\`\`\`

The implementation is straightforward. I'll make the necessary changes and ensure everything passes the existing test suite.

**Next steps:**
1. Apply the code changes
2. Run the test suite
3. Verify the build succeeds`,
]

const LONG_RESPONSE = (displayId: string, title: string) =>
  `好的，我来详细展示 ${displayId} 的完整实现方案。

## 1. 数据模型设计

首先定义核心类型：

\`\`\`typescript
// types/kanban.ts
export interface Board {
  id: string;
  name: string;
  columns: Column[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  color: string;
  sortOrder: number;
  wipLimit?: number;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignee?: string;
  tags: Tag[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
\`\`\`

## 2. API 路由实现

\`\`\`typescript
// app/routes/issues.ts
import { Hono } from 'hono';
import { db } from '../db';
import { issues, issuesTags } from '../db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

const app = new Hono();

// GET /api/projects/:projectId/issues
app.get('/', async (c) => {
  const projectId = c.req.param('projectId');

  const result = await db
    .select()
    .from(issues)
    .where(
      and(
        eq(issues.projectId, projectId),
        eq(issues.isDeleted, false)
      )
    )
    .orderBy(asc(issues.sortOrder), desc(issues.createdAt));

  // Fetch tags for each issue
  const issuesWithTags = await Promise.all(
    result.map(async (issue) => {
      const tags = await db
        .select()
        .from(issuesTags)
        .where(eq(issuesTags.issueId, issue.id));
      return { ...issue, tags };
    })
  );

  return c.json({ success: true, data: issuesWithTags });
});

// POST /api/projects/:projectId/issues
app.post('/', async (c) => {
  const projectId = c.req.param('projectId');
  const body = await c.req.json();

  const { title, statusId, priority = 'medium' } = body;

  if (!title?.trim()) {
    return c.json(
      { success: false, error: 'Title is required' },
      400
    );
  }

  const [created] = await db
    .insert(issues)
    .values({
      id: generateULID(),
      projectId,
      statusId,
      title: title.trim(),
      priority,
      sortOrder: Date.now(),
    })
    .returning();

  return c.json({ success: true, data: created }, 201);
});

// PATCH /api/projects/:projectId/issues/:id
app.patch('/:id', async (c) => {
  const { projectId, id } = c.req.param();
  const body = await c.req.json();

  const [updated] = await db
    .update(issues)
    .set({
      ...body,
      updatedAt: new Date().toISOString(),
    })
    .where(
      and(
        eq(issues.id, id),
        eq(issues.projectId, projectId)
      )
    )
    .returning();

  if (!updated) {
    return c.json(
      { success: false, error: 'Issue not found' },
      404
    );
  }

  return c.json({ success: true, data: updated });
});

export default app;
\`\`\`

## 3. 前端组件

### KanbanColumn 拖拽处理

\`\`\`tsx
// components/kanban/KanbanColumn.tsx
import { useDroppable } from '@dnd-kit/react';
import { CollisionPriority } from '@dnd-kit/abstract';
import type { Status, IssueWithTags } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';

export function KanbanColumn({
  status,
  issues,
  selectedIssueId,
}: {
  status: Status;
  issues: IssueWithTags[];
  selectedIssueId: string | null;
}) {
  const { ref } = useDroppable({
    id: status.id,
    type: 'column',
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div
      ref={ref}
      className="flex w-72 flex-col rounded-lg bg-muted/30"
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: status.color }}
        />
        <span className="text-sm font-medium">
          {status.name}
        </span>
        <span className="text-xs text-muted-foreground ml-auto">
          {issues.length}
        </span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-2 pb-2">
        {issues.map((issue, index) => (
          <KanbanCard
            key={issue.id}
            issue={issue}
            index={index}
            columnId={status.id}
            isSelected={issue.id === selectedIssueId}
          />
        ))}
      </div>
    </div>
  );
}
\`\`\`

### 拖拽排序逻辑

\`\`\`typescript
// stores/board-store.ts
import { create } from 'zustand';
import type { IssueWithTags, Status } from '@/types/kanban';

interface BoardState {
  groupedItems: Record<string, IssueWithTags[]>;
  syncFromServer: (
    statuses: Status[],
    issues: IssueWithTags[]
  ) => void;
  applyDragOver: (event: DragOverEvent) => void;
  applyDragEnd: (event: DragEndEvent) => Update[];
}

export const useBoardStore = create<BoardState>(
  (set, get) => ({
    groupedItems: {},

    syncFromServer: (statuses, issues) => {
      const grouped: Record<string, IssueWithTags[]> = {};
      for (const status of statuses) {
        grouped[status.id] = issues
          .filter((i) => i.statusId === status.id)
          .sort((a, b) => a.sortOrder - b.sortOrder);
      }
      set({ groupedItems: grouped });
    },

    applyDragOver: (event) => {
      // Handle cross-column dragging
      const { source, target } = event.operation;
      if (!source || !target) return;

      set((state) => {
        const next = { ...state.groupedItems };
        // ... reorder logic
        return { groupedItems: next };
      });
    },

    applyDragEnd: (event) => {
      const updates: Update[] = [];
      const { groupedItems } = get();

      for (const [statusId, items] of Object.entries(
        groupedItems
      )) {
        items.forEach((item, index) => {
          if (
            item.statusId !== statusId ||
            item.sortOrder !== index
          ) {
            updates.push({
              id: item.id,
              changes: { statusId, sortOrder: index },
            });
          }
        });
      }

      return updates;
    },
  })
);
\`\`\`

## 4. 数据库 Schema

\`\`\`typescript
// db/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { ulid } from 'ulid';

const commonFields = {
  id: text('id').primaryKey().$defaultFn(() => ulid()),
  createdAt: text('created_at')
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .$defaultFn(() => new Date().toISOString()),
  isDeleted: integer('is_deleted', { mode: 'boolean' })
    .default(false),
};

export const projects = sqliteTable('projects', {
  ...commonFields,
  name: text('name').notNull(),
  prefix: text('prefix').notNull(),
});

export const statuses = sqliteTable('statuses', {
  ...commonFields,
  projectId: text('project_id').notNull()
    .references(() => projects.id),
  name: text('name').notNull(),
  color: text('color').notNull().default('#6b7280'),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const issues = sqliteTable('issues', {
  ...commonFields,
  projectId: text('project_id').notNull()
    .references(() => projects.id),
  statusId: text('status_id').notNull()
    .references(() => statuses.id),
  issueNumber: integer('issue_number').notNull(),
  displayId: text('display_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').notNull().default('medium'),
  sortOrder: integer('sort_order').notNull().default(0),
  parentIssueId: text('parent_issue_id'),
});
\`\`\`

以上是 **${title}** 的完整实现方案，涵盖了类型定义、API 路由、前端组件和数据库 schema。所有代码已通过 lint 和类型检查。`

const TEST_RESPONSE = (displayId: string) =>
  `好的，下面是 ${displayId} 对应的单元测试：

## API 路由测试

\`\`\`typescript
// tests/api/issues.test.ts
import { describe, it, expect, beforeEach } from 'bun:test';
import { app } from '../../app/app';

describe('GET /api/projects/:projectId/issues', () => {
  it('should return all issues for a project', async () => {
    const res = await app.request(
      '/api/projects/test-project/issues'
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('should return issues sorted by sortOrder', async () => {
    const res = await app.request(
      '/api/projects/test-project/issues'
    );
    const { data } = await res.json();

    for (let i = 1; i < data.length; i++) {
      expect(data[i].sortOrder).toBeGreaterThanOrEqual(
        data[i - 1].sortOrder
      );
    }
  });

  it('should not return deleted issues', async () => {
    const res = await app.request(
      '/api/projects/test-project/issues'
    );
    const { data } = await res.json();

    for (const issue of data) {
      expect(issue.isDeleted).toBeFalsy();
    }
  });
});

describe('POST /api/projects/:projectId/issues', () => {
  it('should create a new issue', async () => {
    const res = await app.request(
      '/api/projects/test-project/issues',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Issue',
          statusId: 'status-1',
          priority: 'high',
        }),
      }
    );
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.success).toBe(true);
    expect(json.data.title).toBe('Test Issue');
    expect(json.data.priority).toBe('high');
  });

  it('should reject empty title', async () => {
    const res = await app.request(
      '/api/projects/test-project/issues',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
          statusId: 'status-1',
        }),
      }
    );
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it('should default priority to medium', async () => {
    const res = await app.request(
      '/api/projects/test-project/issues',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Default Priority',
          statusId: 'status-1',
        }),
      }
    );
    const { data } = await res.json();

    expect(data.priority).toBe('medium');
  });
});
\`\`\`

## 前端组件测试

\`\`\`typescript
// tests/components/KanbanCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from
  '@testing-library/react';
import { KanbanCard } from
  '@/components/kanban/KanbanCard';

const mockIssue = {
  id: 'issue-1',
  projectId: 'proj-1',
  statusId: 'status-1',
  issueNumber: 1,
  displayId: 'PRJ-1',
  title: 'Test Issue Title',
  description: 'A test description',
  priority: 'high' as const,
  sortOrder: 0,
  parentIssueId: null,
  tags: [
    { id: 'tag-1', projectId: 'proj-1', name: 'bug', color: '#ef4444' },
  ],
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('KanbanCard', () => {
  it('renders issue title', () => {
    render(
      <KanbanCard
        issue={mockIssue}
        index={0}
        columnId="status-1"
        isSelected={false}
      />
    );
    expect(
      screen.getByText('Test Issue Title')
    ).toBeInTheDocument();
  });

  it('renders displayId', () => {
    render(
      <KanbanCard
        issue={mockIssue}
        index={0}
        columnId="status-1"
        isSelected={false}
      />
    );
    expect(
      screen.getByText('PRJ-1')
    ).toBeInTheDocument();
  });

  it('renders priority icon', () => {
    render(
      <KanbanCard
        issue={mockIssue}
        index={0}
        columnId="status-1"
        isSelected={false}
      />
    );
    expect(
      screen.getByLabelText('high priority')
    ).toBeInTheDocument();
  });

  it('highlights when selected', () => {
    const { container } = render(
      <KanbanCard
        issue={mockIssue}
        index={0}
        columnId="status-1"
        isSelected={true}
      />
    );
    expect(
      container.firstChild
    ).toHaveClass('ring-2');
  });

  it('renders tags', () => {
    render(
      <KanbanCard
        issue={mockIssue}
        index={0}
        columnId="status-1"
        isSelected={false}
      />
    );
    expect(
      screen.getByText('bug')
    ).toBeInTheDocument();
  });
});
\`\`\`

所有测试通过 ✓ 覆盖率 87%。`

export function generateMockChat(issue: {
  id: string
  displayId: string
  title: string
  description: string | null
  priority: string
  createdAt: string
}): ChatMessage[] {
  const rand = seededRandom(issue.id)
  const templateIdx = Math.floor(rand() * ASSISTANT_TEMPLATES.length)
  const base = issue.createdAt

  return [
    {
      id: `${issue.id}-sys-1`,
      role: 'system',
      content: 'hook: pre-tool-use session started',
      timestamp: offsetTime(base, 0),
      systemType: 'hook_started',
    },
    {
      id: `${issue.id}-sys-2`,
      role: 'system',
      content: `hook response: session initialized for ${issue.displayId}`,
      timestamp: offsetTime(base, 0),
      systemType: 'hook_response',
    },
    {
      id: `${issue.id}-sys-3`,
      role: 'system',
      content: `model: claude-opus-4-6 | context: ${Math.floor(rand() * 40 + 10)}k tokens`,
      timestamp: offsetTime(base, 0),
      systemType: 'model_init',
    },
    {
      id: `${issue.id}-user-1`,
      role: 'user',
      content: issue.title,
      timestamp: offsetTime(base, 1),
    },
    {
      id: `${issue.id}-asst-1`,
      role: 'assistant',
      content: ASSISTANT_TEMPLATES[templateIdx](
        issue.title,
        issue.description,
        issue.priority,
      ),
      timestamp: offsetTime(base, 2),
    },
    {
      id: `${issue.id}-sys-4`,
      role: 'system',
      content:
        'hook: tool-use Read frontend/src/components/kanban/KanbanBoard.tsx',
      timestamp: offsetTime(base, 3),
      systemType: 'hook_started',
    },
    {
      id: `${issue.id}-user-2`,
      role: 'user',
      content: '请展示具体的实现方案和代码',
      timestamp: offsetTime(base, 4),
    },
    {
      id: `${issue.id}-asst-2`,
      role: 'assistant',
      content: LONG_RESPONSE(issue.displayId, issue.title),
      timestamp: offsetTime(base, 5),
    },
    {
      id: `${issue.id}-user-3`,
      role: 'user',
      content: '添加单元测试',
      timestamp: offsetTime(base, 8),
    },
    {
      id: `${issue.id}-asst-3`,
      role: 'assistant',
      content: TEST_RESPONSE(issue.displayId),
      timestamp: offsetTime(base, 9),
    },
  ]
}
