'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TIME_PRESETS, formatDuration } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface DurationInputProps {
  value?: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showPresets?: boolean
  className?: string
}

export function DurationInput({
  value,
  onChange,
  min = 0.25,
  max = 24,
  step = 0.25,
  disabled,
  showPresets = true,
  className,
}: DurationInputProps) {
  const handleIncrement = () => {
    const newValue = Math.min((value || 0) + step, max)
    onChange(newValue)
  }

  const handleDecrement = () => {
    const newValue = Math.max((value || 0) - step, min)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === '') {
      onChange(0)
      return
    }
    const num = parseFloat(val)
    if (!isNaN(num) && num >= 0 && num <= max) {
      onChange(num)
    }
  }

  const handlePresetClick = (preset: number) => {
    onChange(preset)
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Stepper Input */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleDecrement}
          disabled={disabled || (value || 0) <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="relative flex-1">
          <Input
            type="number"
            step={step}
            min={min}
            max={max}
            value={value || ''}
            onChange={handleInputChange}
            disabled={disabled}
            className="text-center text-lg font-semibold pr-12"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            hours
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleIncrement}
          disabled={disabled || (value || 0) >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Duration Display */}
      {value && value > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {formatDuration(value)}
        </p>
      )}

      {/* Presets */}
      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {TIME_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant={value === preset.value ? 'default' : 'outline'}
              size="sm"
              className="min-h-[44px] min-w-[48px] flex-1"
              onClick={() => handlePresetClick(preset.value)}
              disabled={disabled}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
