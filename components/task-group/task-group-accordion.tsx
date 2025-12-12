'use client'

import { useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { TaskGroupHeader } from './task-group-header'
import { DraggableTaskCard } from './draggable-task-card'
import { TaskDetailPanel } from '@/components/task/task-detail-panel'
import type { TaskGroup, Task } from '@/lib/types'
import { Plus, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface TaskGroupAccordionProps {
  group: TaskGroup
  tasks: Task[]
  onToggleCollapse: () => void
  onEditGroup: () => void
  onDeleteGroup: () => void
  onRenameGroup: (name: string) => void
  onAddTask: () => void
}

export function TaskGroupAccordion({
  group,
  tasks,
  onToggleCollapse,
  onEditGroup,
  onDeleteGroup,
  onRenameGroup,
  onAddTask,
}: TaskGroupAccordionProps) {
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
    <div
      ref={setGroupRef}
      style={groupStyle}
      className={cn(
        'rounded-lg border bg-card',
        isGroupDragging && 'opacity-50 ring-2 ring-primary'
      )}
      {...groupAttributes}
    >
      <div ref={setDropRef}>
        <Collapsible open={!group.isCollapsed} onOpenChange={() => onToggleCollapse()}>
          <CollapsibleTrigger asChild>
            <div>
              <TaskGroupHeader
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
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="px-3 pb-3 space-y-2">
              {/* Tasks */}
              {tasks.length === 0 ? (
                <div
                  className={cn(
                    'flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg transition-colors',
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
                </div>
              ) : (
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                  <div className={cn(
                    'space-y-2 min-h-[40px] rounded-lg transition-colors',
                    isOver && 'bg-primary/5 ring-2 ring-primary/20'
                  )}>
                    {tasks.map((task) => (
                      <div key={task.id} className="space-y-0">
                        <DraggableTaskCard
                          task={task}
                          onClick={() => handleTaskClick(task.id)}
                        />
                        {expandedTaskId === task.id && (
                          <div className="border border-t-0 rounded-b-lg px-4 pb-4 ml-6 -mt-1">
                            <TaskDetailPanel
                              task={task}
                              isOpen={expandedTaskId === task.id}
                              onToggle={() => setExpandedTaskId(null)}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </SortableContext>
              )}

              {/* Add Task Button */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={onAddTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}
