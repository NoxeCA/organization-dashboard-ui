'use client'

import * as React from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value?: string // "HH:mm" format
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TimePicker({ value, onChange, disabled, className }: TimePickerProps) {
  // Parse value or default to current time
  const [hours, minutes] = React.useMemo(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number)
      return [h, m]
    }
    const now = new Date()
    return [now.getHours(), now.getMinutes()]
  }, [value])

  const updateTime = (newHours: number, newMinutes: number) => {
    // Wrap hours
    if (newHours < 0) newHours = 23
    if (newHours > 23) newHours = 0
    // Wrap minutes
    if (newMinutes < 0) newMinutes = 45
    if (newMinutes > 59) newMinutes = 0

    const h = newHours.toString().padStart(2, '0')
    const m = newMinutes.toString().padStart(2, '0')
    onChange(`${h}:${m}`)
  }

  const incrementHours = () => updateTime(hours + 1, minutes)
  const decrementHours = () => updateTime(hours - 1, minutes)
  const incrementMinutes = () => updateTime(hours, minutes + 15)
  const decrementMinutes = () => updateTime(hours, minutes - 15)

  // Format for display
  const displayHours = hours.toString().padStart(2, '0')
  const displayMinutes = minutes.toString().padStart(2, '0')

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Hours */}
      <div className="flex flex-col items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-10"
          onClick={incrementHours}
          disabled={disabled}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="text-2xl font-mono font-semibold tabular-nums min-w-[2.5rem] text-center">
          {displayHours}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-10"
          onClick={decrementHours}
          disabled={disabled}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Separator */}
      <span className="text-2xl font-semibold">:</span>

      {/* Minutes */}
      <div className="flex flex-col items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-10"
          onClick={incrementMinutes}
          disabled={disabled}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div className="text-2xl font-mono font-semibold tabular-nums min-w-[2.5rem] text-center">
          {displayMinutes}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-10"
          onClick={decrementMinutes}
          disabled={disabled}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface TimeRangePickerProps {
  startTime?: string
  endTime?: string
  onStartTimeChange: (value: string) => void
  onEndTimeChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function TimeRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  disabled,
  className,
}: TimeRangePickerProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground font-medium">Start</span>
        <TimePicker
          value={startTime}
          onChange={onStartTimeChange}
          disabled={disabled}
        />
      </div>
      <div className="text-muted-foreground text-lg">→</div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground font-medium">End</span>
        <TimePicker
          value={endTime}
          onChange={onEndTimeChange}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
