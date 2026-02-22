import { useRef, useState, useEffect, useCallback } from 'react'
import { LayoutGrid, Plus, Settings } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Project } from '@/types/kanban'
import { useProjects, useCreateProject } from '@/hooks/use-kanban'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

function getProjectInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return '??'
  const words = trimmed.split(/\s+/)
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }
  return trimmed.slice(0, 2).toUpperCase()
}

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

function ProjectButton({
  project,
  colorClass,
  isActive,
  onClick,
}: {
  project: Project
  colorClass: string
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
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltip(null)}
        className={`flex items-center justify-center w-9 h-9 rounded-lg text-[11px] font-bold text-white transition-all cursor-pointer focus:outline-none ${
          isActive
            ? `${colorClass} ring-2 ring-primary/50 ring-offset-1 ring-offset-card`
            : `${colorClass} opacity-50 hover:opacity-90`
        }`}
        aria-label={project.name}
      >
        {getProjectInitials(project.name)}
      </button>
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

function CreateProjectPopover({
  onCreated,
  onClose,
}: {
  onCreated: (project: Project) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [prefix, setPrefix] = useState('')
  const createProject = useCreateProject()
  const popoverRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleNameChange = (value: string) => {
    setName(value)
    if (!prefix || prefix === derivePrefix(name)) {
      setPrefix(derivePrefix(value))
    }
  }

  const handleSubmit = useCallback(() => {
    const trimmedName = name.trim()
    const trimmedPrefix = prefix.trim().toUpperCase()
    if (!trimmedName || !trimmedPrefix) return
    createProject.mutate(
      { name: trimmedName, prefix: trimmedPrefix },
      { onSuccess: (project) => onCreated(project) },
    )
  }, [name, prefix, createProject, onCreated])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      ref={popoverRef}
      className="absolute left-full top-0 ml-2 z-50 w-56 rounded-lg border bg-popover p-3 shadow-lg"
    >
      <p className="text-sm font-medium mb-2">New Project</p>
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Project name"
          className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          type="text"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Prefix (e.g. PRJ)"
          maxLength={5}
          className="w-full rounded-md border bg-background px-2.5 py-1.5 text-sm uppercase outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={createProject.isPending || !name.trim() || !prefix.trim()}
            className="flex-1 text-xs"
          >
            {createProject.isPending ? 'Creating...' : 'Create'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
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
    <div className="flex flex-col items-center h-full w-14 py-3 gap-1 bg-card border-r border-border shrink-0">
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
        className="flex flex-col items-center gap-1.5 overflow-y-auto flex-1 py-0.5"
        style={{ scrollbarWidth: 'none' }}
      >
        {projects?.map((project, index) => (
          <ProjectButton
            key={project.id}
            project={project}
            colorClass={getProjectColor(index)}
            isActive={activeProjectId === project.id}
            onClick={() => navigate(projectPath(project.id))}
          />
        ))}
      </div>

      {/* Create project */}
      <div className="relative">
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
        {showCreate ? (
          <CreateProjectPopover
            onCreated={handleProjectCreated}
            onClose={() => setShowCreate(false)}
          />
        ) : null}
      </div>

      {/* Bottom section */}
      <div className="mt-auto flex flex-col items-center gap-1">
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
