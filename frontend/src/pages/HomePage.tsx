import { useNavigate } from 'react-router-dom'
import { FolderKanban, FolderOpen, Plus, Hash, Layers } from 'lucide-react'
import { useProjects, useCreateProject } from '@/hooks/use-kanban'
import { useProjectStats } from '@/hooks/use-project-stats'
import type { Project } from '@/types/kanban'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from '@/components/ui/dialog'
import { useState, useCallback } from 'react'

const PROJECT_COLORS = [
  'bg-blue-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-pink-600',
  'bg-teal-600',
]

function getProjectColor(index: number): string {
  return PROJECT_COLORS[index % PROJECT_COLORS.length] ?? PROJECT_COLORS[0]
}

function getProjectInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '??'
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

function derivePrefix(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length >= 2) {
    return words
      .slice(0, 3)
      .map((w) => w.charAt(0))
      .join('')
      .toUpperCase()
  }
  return name.trim().slice(0, 3).toUpperCase()
}

function ProjectCard({
  project,
  colorClass,
  onClick,
}: {
  project: Project
  colorClass: string
  onClick: () => void
}) {
  const stats = useProjectStats(project.id)

  return (
    <Card
      className="bg-card/70 hover:bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${colorClass}`}
          >
            {getProjectInitials(project.name)}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
              {project.name}
            </CardTitle>
            <CardDescription className="mt-1">
              <Badge variant="secondary" className="text-[10px] font-mono">
                {project.prefix}
              </Badge>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {stats.issueCount} issues
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {stats.statusCount} statuses
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function CreateProjectDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (p: Project) => void
}) {
  const [name, setName] = useState('')
  const [prefix, setPrefix] = useState('')
  const createProject = useCreateProject()

  const reset = () => {
    setName('')
    setPrefix('')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!prefix || prefix === derivePrefix(name)) {
      setPrefix(derivePrefix(value))
    }
  }

  const handleSubmit = () => {
    const trimmedName = name.trim()
    const trimmedPrefix = prefix.trim().toUpperCase()
    if (!trimmedName || !trimmedPrefix) return
    createProject.mutate(
      { name: trimmedName, prefix: trimmedPrefix },
      {
        onSuccess: (project) => {
          onCreated(project)
          onOpenChange(false)
          reset()
        },
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription className="mt-1">
              Select or create a repository for your project
            </DialogDescription>
          </div>
          <DialogCloseButton />
        </DialogHeader>
        <div className="space-y-5 px-5 pb-5 pt-2">
          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Repository Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="my-project"
              autoFocus
              className="w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              This will be the folder name for your new repository
            </p>
          </div>

          {/* Parent Directory */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Parent Directory
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                onKeyDown={handleKeyDown}
                placeholder="Current Directory"
                maxLength={5}
                className="flex-1 rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 shrink-0"
                tabIndex={-1}
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to use your current working directory
            </p>
          </div>

          {/* Submit */}
          <Button
            className="w-full"
            variant="outline"
            onClick={handleSubmit}
            disabled={createProject.isPending || !name.trim() || !prefix.trim()}
          >
            {createProject.isPending ? 'Creating...' : 'Create Repository'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()
  const [showCreate, setShowCreate] = useState(false)

  const handleProjectCreated = useCallback(
    (project: Project) => {
      navigate(`/projects/${project.id}`)
    },
    [navigate],
  )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <span className="rounded-xl bg-primary/15 p-2 text-primary">
            <FolderKanban className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          {projects ? (
            <Badge variant="secondary" className="ml-1">
              {projects.length}
            </Badge>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            className="ml-auto"
            onClick={() => setShowCreate(true)}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-card/30 animate-pulse min-h-[140px]">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-24 rounded bg-muted" />
                      <div className="h-4 w-12 rounded bg-muted" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 w-32 rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects?.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                colorClass={getProjectColor(index)}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleProjectCreated}
      />
    </main>
  )
}
