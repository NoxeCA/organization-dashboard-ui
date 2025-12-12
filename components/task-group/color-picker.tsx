'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { GROUP_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const handleColorSelect = (color: string) => {
    onChange(color)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 border-2"
          disabled={disabled}
          style={{ backgroundColor: value }}
        >
          <span className="sr-only">Pick a color</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="grid grid-cols-5 gap-2">
          {GROUP_COLORS.map((color) => (
            <button
              key={color.value}
              className={cn(
                'h-7 w-7 rounded-md border-2 transition-all hover:scale-110',
                value === color.value
                  ? 'border-foreground ring-2 ring-offset-2 ring-offset-background'
                  : 'border-transparent'
              )}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorSelect(color.value)}
              title={color.name}
            >
              {value === color.value && (
                <Check className="h-4 w-4 mx-auto text-white drop-shadow-md" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
