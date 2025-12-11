'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  SERVICE_CALL_STATUS_COLORS,
  SERVICE_CALL_STATUS_OPTIONS,
  PRIORITY_COLORS,
  PRIORITY_OPTIONS
} from '@/lib/constants'
import type { ServiceCallStatus, ServiceCallPriority } from '@/lib/types'

interface StatusBadgeProps {
  status: ServiceCallStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusLabel = SERVICE_CALL_STATUS_OPTIONS.find((s) => s.value === status)?.label || status

  return (
    <Badge className={cn(SERVICE_CALL_STATUS_COLORS[status], className)}>
      {statusLabel}
    </Badge>
  )
}

interface PriorityBadgeProps {
  priority: ServiceCallPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const priorityLabel = PRIORITY_OPTIONS.find((p) => p.value === priority)?.label || priority

  return (
    <Badge className={cn(PRIORITY_COLORS[priority], className)}>
      {priorityLabel}
    </Badge>
  )
}
