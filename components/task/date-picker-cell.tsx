'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { format, isPast, isToday, isTomorrow, differenceInDays } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'

interface DatePickerCellProps {
  value?: string // ISO date string
  onChange: (date: string | undefined) => void
  disabled?: boolean
  className?: string
}

export function DatePickerCell({
  value,
  onChange,
  disabled = false,
  className,
}: DatePickerCellProps) {
  const [open, setOpen] = useState(false)

  const date = value ? new Date(value) : undefined

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onChange(selectedDate.toISOString())
    }
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
    setOpen(false)
  }

  // Get display text and color based on date
  const getDateDisplay = () => {
    if (!date) {
      return { text: '-', color: 'text-muted-foreground' }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (isToday(date)) {
      return { text: 'Today', color: 'text-blue-600 font-medium' }
    }

    if (isTomorrow(date)) {
      return { text: 'Tomorrow', color: 'text-blue-600' }
    }

    if (isPast(date)) {
      return { text: format(date, 'MMM d'), color: 'text-red-600 font-medium' }
    }

    const daysUntil = differenceInDays(date, today)
    if (daysUntil <= 7) {
      return { text: format(date, 'EEE, MMM d'), color: 'text-amber-600' }
    }

    return { text: format(date, 'MMM d'), color: 'text-muted-foreground' }
  }

  const { text, color } = getDateDisplay()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          className={cn(
            'flex items-center justify-end gap-1 text-xs min-w-[80px] h-7 px-1 rounded transition-colors hover:bg-muted/50 group',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
          <span className={cn(color)}>{text}</span>
          {date && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleClear(e as unknown as React.MouseEvent)
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded cursor-pointer"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
        <div className="flex items-center justify-between p-2 border-t">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => handleSelect(new Date())}
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                const tomorrow = new Date()
                tomorrow.setDate(tomorrow.getDate() + 1)
                handleSelect(tomorrow)
              }}
            >
              Tomorrow
            </Button>
          </div>
          {date && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
