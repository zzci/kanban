import { useRef, useState, useCallback } from 'react'
import { LayoutGrid, Moon, Plus, Settings, Sun } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Project } from '@/types/kanban'
import { useProjects } from '@/hooks/use-kanban'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CreateProjectDialog } from '@/components/CreateProjectDialog'
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

function ProjectButton({
  project,
  isActive,
  onClick,
}: {
  project: Project
  isActive: boolean
  onClick: () => void
}) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)

  const showTooltip = () => {
    const rect = btnRef.current?.getBoundingClientRect()
    if (rect) {
      setTooltip({ x: rect.right + 10, y: rect.top + rect.height / 2 })
    }
  }

  return (
    <>
      <div className="relative flex items-center justify-center">
        {isActive ? (
          <span className="absolute left-[-9px] h-5 w-[3px] rounded-r-full bg-primary" />
        ) : null}
        <button
          ref={btnRef}
          type="button"
          onClick={onClick}
          onMouseEnter={showTooltip}
          onMouseLeave={() => setTooltip(null)}
          className={`flex items-center justify-center w-9 h-9 rounded-lg text-[11px] font-bold transition-all cursor-pointer focus:outline-none ${
            isActive
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-foreground/[0.07] text-foreground/60 hover:bg-foreground/[0.13] hover:text-foreground/80'
          }`}
          aria-label={project.name}
        >
          {getProjectInitials(project.name)}
        </button>
      </div>
      {tooltip ? (
        <div
          className="fixed z-[100] whitespace-nowrap rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border pointer-events-none animate-in fade-in-0 zoom-in-95 duration-100"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translateY(-50%)',
          }}
        >
          {project.name}
        </div>
      ) : null}
    </>
  )
}

export function AppSidebar({ activeProjectId }: { activeProjectId: string }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: projects } = useProjects()
  const [showCreate, setShowCreate] = useState(false)

  const isIssuesRoute = location.pathname.includes('/issues')

  const projectPath = useCallback(
    (projectId: string) =>
      isIssuesRoute
        ? `/projects/${projectId}/issues`
        : `/projects/${projectId}`,
    [isIssuesRoute],
  )

  const handleProjectCreated = useCallback(
    (project: Project) => {
      setShowCreate(false)
      navigate(projectPath(project.id))
    },
    [navigate, projectPath],
  )

  return (
    <div className="flex flex-col items-center h-full w-14 py-3 gap-1 bg-sidebar border-r border-sidebar-border shrink-0">
      {/* Home */}
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        aria-label="Home"
        title="Home"
        onClick={() => navigate('/')}
      >
        <LayoutGrid className="h-4.5 w-4.5" />
      </Button>

      <Separator className="mx-2 my-1 w-8" />

      {/* Project list */}
      <div
        className="flex flex-col items-center gap-2 overflow-y-auto flex-1 py-1 px-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {projects?.map((project) => (
          <ProjectButton
            key={project.id}
            project={project}
            isActive={activeProjectId === project.id}
            onClick={() => navigate(projectPath(project.id))}
          />
        ))}
      </div>

      {/* Create project */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowCreate(true)}
        className="h-9 w-9 text-muted-foreground"
        aria-label="Create project"
        title="Create project"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <CreateProjectDialog
        open={showCreate}
        onOpenChange={setShowCreate}
        onCreated={handleProjectCreated}
      />

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center gap-1">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground"
          aria-label="Settings"
          title="Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function ThemeToggle() {
  const { resolved, toggle } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground"
      aria-label={
        resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      title={
        resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      onClick={toggle}
    >
      {resolved === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}
