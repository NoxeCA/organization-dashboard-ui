'use client'

import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { TaskStatus } from '@/lib/types'
import {
  TASK_STATUS_OPTIONS,
  TASK_STATUS_SOLID_COLORS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface StatusSelectorProps {
  value: TaskStatus
  onChange: (status: TaskStatus) => void
  disabled?: boolean
  className?: string
}

export function StatusSelector({
  value,
  onChange,
  disabled = false,
  className,
}: StatusSelectorProps) {
  const [open, setOpen] = useState(false)

  const currentStatus = TASK_STATUS_OPTIONS.find((s) => s.value === value)
  const currentColors = TASK_STATUS_SOLID_COLORS[value]

  const handleSelect = (status: TaskStatus) => {
    onChange(status)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          className={cn(
            'flex items-center justify-center px-2 py-1 rounded text-xs font-medium min-w-[90px] transition-all hover:opacity-80',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          style={{
            backgroundColor: currentColors.bg,
            color: currentColors.text,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {currentStatus?.label || 'Select'}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[140px] p-1"
        align="center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-0.5">
          {TASK_STATUS_OPTIONS.map((status) => {
            const colors = TASK_STATUS_SOLID_COLORS[status.value]
            const isSelected = status.value === value

            return (
              <button
                key={status.value}
                className={cn(
                  'flex items-center justify-between px-2 py-1.5 rounded text-xs font-medium transition-all hover:opacity-90',
                  isSelected && 'ring-2 ring-offset-1 ring-primary'
                )}
                style={{
                  backgroundColor: colors.bg,
                  color: colors.text,
                }}
                onClick={() => handleSelect(status.value)}
              >
                <span>{status.label}</span>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
