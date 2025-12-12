'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import type { TaskGroup, Task } from '@/lib/types'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskGroupListHeaderProps {
  group: TaskGroup
  tasks: Task[]
  isCollapsed: boolean
  onToggleCollapse: () => void
  onEdit: () => void
  onDelete: () => void
  onRename: (name: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
  isOver?: boolean
}

export function TaskGroupListHeader({
  group,
  tasks,
  isCollapsed,
  onToggleCollapse,
  onEdit,
  onDelete,
  onRename,
  dragHandleProps,
  isDragging,
  isOver,
}: TaskGroupListHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(group.name)

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const handleNameSubmit = () => {
    if (editName.trim() && editName !== group.name) {
      onRename(editName.trim())
    } else {
      setEditName(group.name)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit()
    } else if (e.key === 'Escape') {
      setEditName(group.name)
      setIsEditing(false)
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: isOver ? 'rgba(var(--primary), 0.05)' : 'transparent',
      }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors bg-muted/30 hover:bg-muted/50 border-b',
        isDragging && 'opacity-50',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0 -ml-1"
        onClick={(e) => {
          e.stopPropagation()
          onToggleCollapse()
        }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.div>
      </Button>

      {/* Group Color Indicator */}
      <div
        className="h-4 w-1 rounded-full flex-shrink-0"
        style={{ backgroundColor: group.color }}
      />

      {/* Group Name */}
      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleNameSubmit}
          onKeyDown={handleKeyDown}
          className="h-6 w-40 text-sm font-semibold bg-transparent border-primary/50 p-1"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!group.isDefault) setIsEditing(true)
          }}
          className={cn(
            'text-sm font-semibold',
            !group.isDefault && 'hover:text-primary cursor-text'
          )}
          disabled={group.isDefault}
        >
          {group.name}
        </button>
      )}

      {/* Task Count */}
      <span className="text-xs text-muted-foreground">
        {completedTasks}/{totalTasks}
      </span>

      {/* Progress Bar */}
      {totalTasks > 0 && (
        <div className="w-20 hidden sm:block">
          <Progress
            value={progressPercent}
            className="h-1.5"
            style={{
              // @ts-ignore - Custom CSS variable for progress color
              '--progress-foreground': group.color,
            } as React.CSSProperties}
          />
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions Menu */}
      {!group.isDefault && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Group
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Group
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </motion.div>
  )
}
