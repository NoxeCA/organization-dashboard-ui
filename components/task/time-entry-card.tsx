'use client'

import * as React from 'react'
import { Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  formatCurrency,
  formatDate,
  formatDuration,
  RATE_TYPE_OPTIONS,
  RATE_TYPE_COLORS,
  RATE_MULTIPLIERS,
} from '@/lib/constants'
import type { TimeEntry, Employee } from '@/lib/types'

interface TimeEntryCardProps {
  entry: TimeEntry
  employee?: Employee
  onEdit?: (entry: TimeEntry) => void
  onDelete?: (entryId: string) => void
  className?: string
}

export function TimeEntryCard({
  entry,
  employee,
  onEdit,
  onDelete,
  className,
}: TimeEntryCardProps) {
  const [expanded, setExpanded] = React.useState(false)

  const rateLabel = RATE_TYPE_OPTIONS.find(r => r.value === entry.rateType)?.label || entry.rateType
  const rateColor = RATE_TYPE_COLORS[entry.rateType]
  const multiplier = RATE_MULTIPLIERS[entry.rateType] || 1

  // Calculate cost
  const cost = employee
    ? entry.hours * employee.hourlyRate * multiplier
    : 0

  const hasNotes = entry.notes && entry.notes.trim().length > 0

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 space-y-3',
        !entry.billable && 'border-dashed border-muted-foreground/50',
        className
      )}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">
              {formatDate(entry.date)}
            </span>
            {!entry.billable && (
              <Badge variant="outline" className="text-xs">
                Non-billable
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {employee?.name || 'Unknown Employee'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(entry)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold">
            {formatDuration(entry.hours)}
          </span>
          <Badge className={cn('font-normal', rateColor)}>
            {rateLabel}
          </Badge>
        </div>
        {cost > 0 && (
          <span className="text-sm font-medium">
            {formatCurrency(cost)}
          </span>
        )}
      </div>

      {/* Time Range (if available) */}
      {entry.startTime && entry.endTime && (
        <p className="text-xs text-muted-foreground">
          {entry.startTime} → {entry.endTime}
        </p>
      )}

      {/* Notes (expandable) */}
      {hasNotes && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Hide notes
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show notes
              </>
            )}
          </Button>
          {expanded && (
            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
              {entry.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
