import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { useCreateProject } from '@/hooks/use-kanban'
import type { Project } from '@/types/kanban'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogCloseButton,
} from '@/components/ui/dialog'

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

export function CreateProjectDialog({
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
