'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TaskListRow } from '@/components/task/task-list-row'
import type { Task } from '@/lib/types'
import { cn } from '@/lib/utils'

interface DraggableTaskRowProps {
  task: Task
  onClick?: () => void
  isExpanded?: boolean
}

export function DraggableTaskRow({
  task,
  onClick,
  isExpanded,
}: DraggableTaskRowProps) {
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
      className={cn(isDragging && 'z-50')}
      {...attributes}
    >
      <TaskListRow
        task={task}
        onClick={onClick}
        isExpanded={isExpanded}
        dragHandleProps={listeners}
        isDragging={isDragging}
      />
    </div>
  )
}
