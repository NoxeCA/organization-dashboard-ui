'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Checkbox } from '@/components/ui/checkbox'
import { useData } from '@/context/data-context'
import type { Task } from '@/lib/types'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusSelector } from './status-selector'
import { PeopleSelector } from './people-selector'
import { DatePickerCell } from './date-picker-cell'
import { InlineEditCell } from './inline-edit-cell'

interface TaskListRowProps {
  task: Task
  onClick?: () => void
  isExpanded?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
  isDragging?: boolean
}

export const TaskListRow = forwardRef<HTMLDivElement, TaskListRowProps>(
  function TaskListRow(
    { task, onClick, isExpanded, dragHandleProps, isDragging },
    ref
  ) {
    const { employees, updateTask } = useData()

    const isCompleted = task.status === 'completed'
    const isCancelled = task.status === 'cancelled'
    const isTerminal = isCompleted || isCancelled

    const handleCheckboxClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (isTerminal) {
        // Reopen task
        updateTask(task.id, { status: 'todo' })
        return
      }

      // Progress through status workflow
      if (task.status === 'todo') {
        updateTask(task.id, { status: 'in_progress' })
        // Then immediately complete
        setTimeout(() => {
          updateTask(task.id, { status: 'completed' })
        }, 0)
      } else if (task.status === 'in_progress') {
        updateTask(task.id, { status: 'completed' })
      }
    }

    const handleRowClick = () => {
      onClick?.()
    }

    const handleTitleChange = (title: string) => {
      updateTask(task.id, { title })
    }

    const handleStatusChange = (status: Task['status']) => {
      updateTask(task.id, { status })
    }

    const handlePeopleChange = (assignedEmployees: string[]) => {
      updateTask(task.id, { assignedEmployees })
    }

    const handleOwnerChange = (ownerId: string | undefined) => {
      updateTask(task.id, { ownerId })
    }

    const handleDateChange = (dueDate: string | undefined) => {
      updateTask(task.id, { dueDate })
    }

    return (
      <motion.div
        ref={ref}
        initial={false}
        animate={{
          opacity: isDragging ? 0.5 : isCompleted ? 0.7 : isCancelled ? 0.5 : 1,
          scale: isDragging ? 1.02 : 1,
        }}
        transition={{ duration: 0.15 }}
        className={cn(
          'flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer group border-b last:border-b-0 bg-background',
          isExpanded && 'bg-muted/20',
        )}
        onClick={handleRowClick}
      >
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className={cn(
            'flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity',
            isDragging && 'opacity-100'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* Checkbox */}
        <div
          className="flex-shrink-0"
          onClick={handleCheckboxClick}
        >
          <Checkbox
            checked={isCompleted}
            className={cn(
              'h-4 w-4 transition-colors',
              isCancelled && 'opacity-50'
            )}
          />
        </div>

        {/* Task Name - Inline Editable */}
        <div className="flex-[2] min-w-[150px]">
          <InlineEditCell
            value={task.title}
            onChange={handleTitleChange}
            placeholder="Task name..."
            isStrikethrough={isTerminal}
            textClassName="font-medium"
          />
        </div>

        {/* People Selector */}
        <div className="w-[100px] flex-shrink-0 hidden sm:flex justify-center">
          <PeopleSelector
            employees={employees}
            selectedIds={task.assignedEmployees}
            onChange={handlePeopleChange}
            ownerId={task.ownerId}
            onOwnerChange={handleOwnerChange}
          />
        </div>

        {/* Status Selector */}
        <div className="w-[110px] flex-shrink-0 hidden md:flex justify-center">
          <StatusSelector
            value={task.status}
            onChange={handleStatusChange}
          />
        </div>

        {/* Timeline/Date */}
        <div className="w-[100px] flex-shrink-0 hidden lg:flex justify-end">
          <DatePickerCell
            value={task.dueDate}
            onChange={handleDateChange}
          />
        </div>
      </motion.div>
    )
  }
)
