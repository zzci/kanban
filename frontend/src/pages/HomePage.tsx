import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  Plus,
  Hash,
  Layers,
  Moon,
  Sun,
  MoreVertical,
} from 'lucide-react'
import { useProjects } from '@/hooks/use-kanban'
import { useProjectStats } from '@/hooks/use-project-stats'
import type { Project } from '@/types/kanban'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreateProjectDialog } from '@/components/CreateProjectDialog'
import { ProjectSettingsDialog } from '@/components/ProjectSettingsDialog'
import { useState, useCallback } from 'react'
import { useTheme } from '@/hooks/use-theme'

function getProjectInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '??'
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

function ProjectCard({
  project,
  onClick,
}: {
  project: Project
  onClick: () => void
}) {
  const stats = useProjectStats(project.id)
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <Card
        className="bg-card/70 hover:bg-card cursor-pointer transition-all hover:shadow-md hover:border-primary/20 group"
        onClick={onClick}
      >
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold bg-muted text-muted-foreground">
              {getProjectInitials(project.name)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
                {project.name}
              </CardTitle>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowSettings(true)
              }}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.07] transition-colors"
              aria-label="Project settings"
              title="Project settings"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
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
      <ProjectSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        project={project}
      />
    </>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const { data: projects, isLoading } = useProjects()
  const [showCreate, setShowCreate] = useState(false)
  const { resolved, toggle } = useTheme()

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
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={toggle}
              aria-label={
                resolved === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              {resolved === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects?.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
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
