'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface InlineEditCellProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  textClassName?: string
  isStrikethrough?: boolean
}

export function InlineEditCell({
  value,
  onChange,
  placeholder = 'Enter text...',
  disabled = false,
  className,
  textClassName,
  isStrikethrough = false,
}: InlineEditCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (disabled) return
    e.stopPropagation()
    setIsEditing(true)
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (editValue.trim() !== value && editValue.trim()) {
      onChange(editValue.trim())
    } else {
      setEditValue(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setEditValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'h-7 text-sm bg-transparent border-primary/50 focus-visible:ring-1',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      />
    )
  }

  return (
    <div
      className={cn(
        'cursor-text rounded px-1 -mx-1 transition-colors hover:bg-muted/50',
        disabled && 'cursor-default hover:bg-transparent',
        className
      )}
      onDoubleClick={handleDoubleClick}
    >
      <span
        className={cn(
          'text-sm',
          isStrikethrough && 'line-through text-muted-foreground',
          !value && 'text-muted-foreground italic',
          textClassName
        )}
      >
        {value || placeholder}
      </span>
    </div>
  )
}
