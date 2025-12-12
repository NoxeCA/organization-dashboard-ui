'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskCard } from '@/components/task/task-card'
import type { Task } from '@/lib/types'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraggableTaskCardProps {
  task: Task
  onClick?: () => void
}

export function DraggableTaskCard({ task, onClick }: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'TASK',
      task,
      groupId: task.groupId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 z-50'
      )}
      {...attributes}
    >
      <div className="flex items-stretch">
        {/* Drag Handle */}
        <div
          {...listeners}
          className={cn(
            'flex items-center justify-center w-6 cursor-grab active:cursor-grabbing',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-muted rounded-l-lg'
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Task Card */}
        <div className="flex-1">
          <TaskCard task={task} onClick={onClick} />
        </div>
      </div>
    </div>
  )
}
