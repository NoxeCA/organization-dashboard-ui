'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { TaskGroupListHeader } from './task-group-list-header'
import { DraggableTaskRow } from './draggable-task-row'
import { TaskDetailPanel } from '@/components/task/task-detail-panel'
import type { TaskGroup, Task } from '@/lib/types'
import { Plus, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskGroupListProps {
  group: TaskGroup
  tasks: Task[]
  onToggleCollapse: () => void
  onEditGroup: () => void
  onDeleteGroup: () => void
  onRenameGroup: (name: string) => void
  onAddTask: () => void
}

export function TaskGroupList({
  group,
  tasks,
  onToggleCollapse,
  onEditGroup,
  onDeleteGroup,
  onRenameGroup,
  onAddTask,
}: TaskGroupListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  // Sortable for the group itself
  const {
    attributes: groupAttributes,
    listeners: groupListeners,
    setNodeRef: setGroupRef,
    transform: groupTransform,
    transition: groupTransition,
    isDragging: isGroupDragging,
  } = useSortable({
    id: group.id,
    data: {
      type: 'GROUP',
      group,
    },
  })

  // Droppable for receiving tasks when collapsed
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `group-drop-${group.id}`,
    data: {
      type: 'GROUP_DROP_ZONE',
      groupId: group.id,
    },
  })

  const groupStyle = {
    transform: CSS.Transform.toString(groupTransform),
    transition: groupTransition,
  }

  const taskIds = tasks.map((t) => t.id)

  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  return (
    <motion.div
      ref={setGroupRef}
      style={groupStyle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'rounded-xl border bg-card/50 overflow-hidden group mb-6 shadow-sm transition-all hover:shadow-md',
        isGroupDragging && 'opacity-50 ring-2 ring-primary'
      )}
      {...groupAttributes}
    >
      <div ref={setDropRef}>
        <Collapsible open={!group.isCollapsed} onOpenChange={() => onToggleCollapse()}>
          {/* Header */}
          <TaskGroupListHeader
            group={group}
            tasks={tasks}
            isCollapsed={group.isCollapsed}
            onToggleCollapse={onToggleCollapse}
            onEdit={onEditGroup}
            onDelete={onDeleteGroup}
            onRename={onRenameGroup}
            dragHandleProps={groupListeners}
            isDragging={isGroupDragging}
            isOver={isOver && group.isCollapsed}
          />

          <CollapsibleContent>
            {/* Table Header */}
            <div className="flex items-center gap-2 px-3 py-1.5 border-y bg-muted/30 text-xs text-muted-foreground font-medium">
              <div className="w-8" /> {/* Drag handle space */}
              <div className="w-4" /> {/* Checkbox space */}
              <div className="flex-[2] min-w-[150px]">Task</div>
              <div className="w-[100px] hidden sm:flex justify-center">People</div>
              <div className="w-[110px] hidden md:flex justify-center">Status</div>
              <div className="w-[100px] hidden lg:flex justify-end">Due Date</div>
            </div>

            {/* Tasks */}
            <AnimatePresence mode="popLayout">
              {tasks.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={cn(
                    'flex flex-col items-center justify-center py-8 mx-3 my-2 border-2 border-dashed rounded-lg transition-colors',
                    isOver ? 'border-primary bg-primary/5' : 'border-muted'
                  )}
                >
                  <FolderOpen className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    No tasks in this group
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drag tasks here or click + to add
                  </p>
                </motion.div>
              ) : (
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                  <div
                    className={cn(
                      'transition-colors',
                      isOver && 'bg-primary/5'
                    )}
                  >
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.15 }}
                      >
                        <DraggableTaskRow
                          task={task}
                          onClick={() => handleTaskClick(task.id)}
                          isExpanded={expandedTaskId === task.id}
                        />
                        <AnimatePresence>
                          {expandedTaskId === task.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t bg-muted/20 px-4 py-4 overflow-hidden"
                            >
                              <TaskDetailPanel
                                task={task}
                                isOpen={expandedTaskId === task.id}
                                onToggle={() => setExpandedTaskId(null)}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </SortableContext>
              )}
            </AnimatePresence>

            {/* Add Task Row */}
            <div className="p-1 bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-background h-9 rounded-lg border border-transparent hover:border-border transition-all"
                onClick={onAddTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </motion.div>
  )
}
