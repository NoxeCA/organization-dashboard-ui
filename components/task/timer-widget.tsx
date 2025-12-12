'use client'

import * as React from 'react'
import { Play, Square, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { secondsToHours, formatDuration } from '@/lib/constants'
import type { ActiveTimer } from '@/lib/types'

interface TimerWidgetProps {
  activeTimer: ActiveTimer | null
  elapsedSeconds: number
  formattedTime: string
  onStop: () => void
  onCancel: () => void
  taskTitle?: string
  className?: string
}

export function TimerWidget({
  activeTimer,
  elapsedSeconds,
  formattedTime,
  onStop,
  onCancel,
  taskTitle,
  className,
}: TimerWidgetProps) {
  const [showStopDialog, setShowStopDialog] = React.useState(false)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)

  if (!activeTimer) return null

  const hours = secondsToHours(elapsedSeconds)

  return (
    <>
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border bg-card',
          'border-red-200 dark:border-red-900/50',
          className
        )}
      >
        {/* Recording indicator */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </div>
          <Badge variant="outline" className="text-xs border-red-200 text-red-600 dark:border-red-900 dark:text-red-400">
            Recording
          </Badge>
        </div>

        {/* Timer display */}
        <div className="flex-1 min-w-0">
          <p className="text-xl font-mono font-bold tabular-nums">
            {formattedTime}
          </p>
          {taskTitle && (
            <p className="text-xs text-muted-foreground truncate">
              {taskTitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => setShowStopDialog(true)}
          >
            <Square className="h-4 w-4 mr-1 fill-current" />
            Stop
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowCancelDialog(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stop Confirmation */}
      <AlertDialog open={showStopDialog} onOpenChange={setShowStopDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Timer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a time entry for{' '}
              <span className="font-semibold">{formatDuration(hours)}</span>
              {hours < 0.25 && ' (minimum 15 minutes)'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Recording</AlertDialogCancel>
            <AlertDialogAction onClick={onStop}>
              Stop & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Timer?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard the current timer. The recorded time
              ({formattedTime}) will not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Recording</AlertDialogCancel>
            <AlertDialogAction
              onClick={onCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Timer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// Compact version for header/nav display
interface TimerBadgeProps {
  formattedTime: string
  onClick?: () => void
  className?: string
}

export function TimerBadge({ formattedTime, onClick, className }: TimerBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded-md',
        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
        'hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors',
        'text-sm font-mono font-medium',
        className
      )}
    >
      <div className="relative">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <div className="absolute inset-0 w-2 h-2 bg-red-500 rounded-full animate-ping" />
      </div>
      {formattedTime}
    </button>
  )
}
