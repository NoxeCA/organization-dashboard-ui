'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  SERVICE_CALL_STATUS_COLORS,
  SERVICE_CALL_STATUS_OPTIONS,
  PRIORITY_COLORS,
  PRIORITY_OPTIONS
} from '@/lib/constants'
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  FileText,
  XCircle,
  AlertTriangle,
  Zap,
  Minus,
  ArrowUp,
  ChevronDown,
} from 'lucide-react'
import type { ServiceCallStatus, ServiceCallPriority } from '@/lib/types'

interface StatusBadgeProps {
  status: ServiceCallStatus
  className?: string
  showIcon?: boolean
}

interface PriorityBadgeProps {
  priority: ServiceCallPriority
  className?: string
  showIcon?: boolean
}

const statusIcons: Record<ServiceCallStatus, React.ComponentType<{ className?: string }>> = {
  open: Clock,
  in_progress: TrendingUp,
  resolved: CheckCircle2,
  invoiced: FileText,
  closed: XCircle,
}

const priorityIcons: Record<ServiceCallPriority, React.ComponentType<{ className?: string }>> = {
  low: Minus,
  medium: ArrowUp,
  high: AlertTriangle,
  critical: Zap,
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const statusLabel = SERVICE_CALL_STATUS_OPTIONS.find((s) => s.value === status)?.label || status
  const Icon = statusIcons[status]

  return (
    <Badge
      className={cn(
        SERVICE_CALL_STATUS_COLORS[status],
        "gap-1.5 font-medium transition-all hover:scale-105 group",
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {statusLabel}
      <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
    </Badge>
  )
}

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
  const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || priority
  const Icon = priorityIcons[priority]

  return (
    <Badge
      className={cn(
        PRIORITY_COLORS[priority],
        "gap-1.5 font-medium transition-all hover:scale-105 group",
        className
      )}
    >
      {showIcon && Icon && <Icon className="h-3 w-3" />}
      {priorityLabel}
      <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity ml-0.5" />
    </Badge>
  )
}
