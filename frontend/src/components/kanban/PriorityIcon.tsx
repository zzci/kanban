import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Flame,
} from 'lucide-react'
import type { Priority } from '@/types/kanban'

const priorityConfig: Record<Priority, { icon: typeof Flame; color: string; label: string }> = {
  urgent: { icon: Flame, color: 'text-red-500', label: 'Urgent' },
  high: { icon: AlertTriangle, color: 'text-orange-500', label: 'High' },
  medium: { icon: ArrowUp, color: 'text-yellow-500', label: 'Medium' },
  low: { icon: ArrowDown, color: 'text-blue-400', label: 'Low' },
}

export function PriorityIcon({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority]
  const Icon = config.icon
  return (
    <Icon
      className={`h-3.5 w-3.5 shrink-0 ${config.color}`}
      aria-label={config.label}
    />
  )
}
