'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/constants'
import type { TaskGroup, Task } from '@/lib/types'
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskGroupHeaderProps {
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

export function TaskGroupHeader({
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
}: TaskGroupHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(group.name)

  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const totalTasks = tasks.length
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
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
        'bg-muted/50 hover:bg-muted/80',
        isDragging && 'opacity-50',
        isOver && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      {/* Drag Handle */}
      <div
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      {/* Color Indicator */}
      <div
        className="h-3 w-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: group.color }}
      />

      {/* Group Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="h-7 text-sm font-medium"
            autoFocus
          />
        ) : (
          <button
            onClick={() => !group.isDefault && setIsEditing(true)}
            className={cn(
              'text-sm font-semibold text-left truncate block w-full',
              !group.isDefault && 'hover:text-primary cursor-text'
            )}
            disabled={group.isDefault}
          >
            {group.name}
          </button>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {completedTasks}/{totalTasks}
        </span>
        <div className="w-16">
          <Progress value={progressPercent} className="h-1.5" />
        </div>
        <span className="text-xs font-medium w-8 text-right">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Due Date */}
      {group.dueDate && (
        <Badge variant="outline" className="text-xs gap-1 flex-shrink-0">
          <Calendar className="h-3 w-3" />
          {formatDate(group.dueDate)}
        </Badge>
      )}

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 flex-shrink-0"
        onClick={onToggleCollapse}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {/* Actions Menu */}
      {!group.isDefault && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
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
    </div>
  )
}
