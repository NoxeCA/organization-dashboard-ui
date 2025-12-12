'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TaskGroupAccordion } from './task-group-accordion'
import { TaskGroupDialog } from './task-group-dialog'
import { TaskCard } from '@/components/task/task-card'
import { TaskDialog } from '@/components/task/task-dialog'
import { useData } from '@/context/data-context'
import { DEFAULT_GROUP_COLOR } from '@/lib/constants'
import type { Task, TaskGroup, TaskGroupFormData } from '@/lib/types'
import { Plus, CheckCheck, Circle, Clock, CheckCircle2, XCircle, FolderPlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskGroupSectionProps {
  serviceCallId: string
}

export function TaskGroupSection({ serviceCallId }: TaskGroupSectionProps) {
  const {
    getTaskGroupsForServiceCall,
    getTasksForGroup,
    getTasksForServiceCall,
    ensureDefaultGroup,
    addTaskGroup,
    updateTaskGroup,
    deleteTaskGroup,
    toggleGroupCollapse,
    reorderTaskGroups,
    moveTaskToGroup,
    reorderTasksInGroup,
    updateTask,
  } = useData()

  // State
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'GROUP' | 'TASK' | null>(null)
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false)
  const [editGroupDialogOpen, setEditGroupDialogOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<TaskGroup | null>(null)
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<TaskGroup | null>(null)
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false)
  const [createTaskGroupId, setCreateTaskGroupId] = useState<string | null>(null)
  const [completeAllDialogOpen, setCompleteAllDialogOpen] = useState(false)
  const [isAddingGroup, setIsAddingGroup] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  // Ensure default group exists
  useEffect(() => {
    ensureDefaultGroup(serviceCallId)
  }, [serviceCallId, ensureDefaultGroup])

  // Get data
  const groups = getTaskGroupsForServiceCall(serviceCallId)
  const allTasks = getTasksForServiceCall(serviceCallId)

  // Calculate task status summary
  const statusCounts = allTasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  // Get incomplete tasks
  const incompleteTasks = allTasks.filter((t) =>
    ['todo', 'in_progress'].includes(t.status)
  )

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get active item for drag overlay
  const activeTask = useMemo(() => {
    if (activeType === 'TASK' && activeId) {
      return allTasks.find((t) => t.id === activeId)
    }
    return null
  }, [activeType, activeId, allTasks])

  const activeGroup = useMemo(() => {
    if (activeType === 'GROUP' && activeId) {
      return groups.find((g) => g.id === activeId)
    }
    return null
  }, [activeType, activeId, groups])

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const activeData = active.data.current

    setActiveId(active.id as string)
    setActiveType(activeData?.type || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Only handle task moves between groups
    if (activeData?.type !== 'TASK') return

    const activeTask = activeData.task as Task
    let targetGroupId: string | null = null

    // Determine target group
    if (overData?.type === 'TASK') {
      const overTask = overData.task as Task
      targetGroupId = overTask.groupId || null
    } else if (overData?.type === 'GROUP') {
      targetGroupId = overData.group.id
    } else if (overData?.type === 'GROUP_DROP_ZONE') {
      targetGroupId = overData.groupId
    }

    // Move task if different group
    if (targetGroupId && activeTask.groupId !== targetGroupId) {
      moveTaskToGroup(activeTask.id, targetGroupId)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setActiveType(null)

    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    // Handle group reordering
    if (activeData?.type === 'GROUP' && overData?.type === 'GROUP') {
      const oldIndex = groups.findIndex((g) => g.id === active.id)
      const newIndex = groups.findIndex((g) => g.id === over.id)

      if (oldIndex !== newIndex) {
        const newOrder = [...groups]
        const [removed] = newOrder.splice(oldIndex, 1)
        newOrder.splice(newIndex, 0, removed)
        reorderTaskGroups(serviceCallId, newOrder.map((g) => g.id))
      }
    }

    // Handle task reordering within same group
    if (activeData?.type === 'TASK' && overData?.type === 'TASK') {
      const activeTask = activeData.task as Task
      const overTask = overData.task as Task

      if (activeTask.groupId === overTask.groupId) {
        const groupTasks = getTasksForGroup(activeTask.groupId!)
        const oldIndex = groupTasks.findIndex((t) => t.id === active.id)
        const newIndex = groupTasks.findIndex((t) => t.id === over.id)

        if (oldIndex !== newIndex) {
          const newOrder = [...groupTasks]
          const [removed] = newOrder.splice(oldIndex, 1)
          newOrder.splice(newIndex, 0, removed)
          reorderTasksInGroup(activeTask.groupId!, newOrder.map((t) => t.id))
        }
      }
    }
  }

  // Group operations
  const handleCreateGroup = (data: TaskGroupFormData) => {
    addTaskGroup(serviceCallId, data)
    toast.success('Group created')
  }

  const handleUpdateGroup = (data: TaskGroupFormData) => {
    if (selectedGroup) {
      updateTaskGroup(selectedGroup.id, data)
      toast.success('Group updated')
    }
    setSelectedGroup(null)
  }

  const handleDeleteGroup = () => {
    if (groupToDelete) {
      deleteTaskGroup(groupToDelete.id)
      toast.success('Group deleted')
    }
    setGroupToDelete(null)
    setDeleteGroupDialogOpen(false)
  }

  const handleQuickAddGroup = () => {
    if (newGroupName.trim()) {
      addTaskGroup(serviceCallId, {
        name: newGroupName.trim(),
        color: DEFAULT_GROUP_COLOR,
      })
      setNewGroupName('')
      setIsAddingGroup(false)
      toast.success('Group created')
    }
  }

  const handleCompleteAllTasks = () => {
    incompleteTasks.forEach((task) => {
      if (task.status === 'todo') {
        updateTask(task.id, { status: 'in_progress' })
      }
      updateTask(task.id, { status: 'completed' })
    })
    toast.success(`${incompleteTasks.length} task(s) marked as completed`)
    setCompleteAllDialogOpen(false)
  }

  const groupIds = groups.map((g) => g.id)

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">Tasks</h3>
          <Badge variant="secondary" className="text-xs">
            {allTasks.length} Total
          </Badge>
        </div>
        <div className="flex gap-2">
          {incompleteTasks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompleteAllDialogOpen(true)}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Complete All
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCreateGroupDialogOpen(true)}
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1" />
            Add Group
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      {allTasks.length > 0 && (
        <div className="flex flex-wrap gap-4 px-3 py-2 bg-muted/50 rounded-lg">
          {statusCounts.todo > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <Circle className="h-3.5 w-3.5 text-gray-500" />
              <span className="font-medium">{statusCounts.todo}</span>
              <span className="text-muted-foreground">To Do</span>
            </div>
          )}
          {statusCounts.in_progress > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-medium">{statusCounts.in_progress}</span>
              <span className="text-muted-foreground">In Progress</span>
            </div>
          )}
          {statusCounts.completed > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="font-medium">{statusCounts.completed}</span>
              <span className="text-muted-foreground">Completed</span>
            </div>
          )}
          {statusCounts.cancelled > 0 && (
            <div className="flex items-center gap-1.5 text-xs">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="font-medium">{statusCounts.cancelled}</span>
              <span className="text-muted-foreground">Cancelled</span>
            </div>
          )}
        </div>
      )}

      {/* Groups with DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={groupIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {groups.map((group) => {
              const groupTasks = getTasksForGroup(group.id)
              return (
                <TaskGroupAccordion
                  key={group.id}
                  group={group}
                  tasks={groupTasks}
                  onToggleCollapse={() => toggleGroupCollapse(group.id)}
                  onEditGroup={() => {
                    setSelectedGroup(group)
                    setEditGroupDialogOpen(true)
                  }}
                  onDeleteGroup={() => {
                    setGroupToDelete(group)
                    setDeleteGroupDialogOpen(true)
                  }}
                  onRenameGroup={(name) => updateTaskGroup(group.id, { name })}
                  onAddTask={() => {
                    setCreateTaskGroupId(group.id)
                    setCreateTaskDialogOpen(true)
                  }}
                />
              )
            })}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask && (
            <div className="opacity-80">
              <TaskCard task={activeTask} />
            </div>
          )}
          {activeGroup && (
            <div className="opacity-80 rounded-lg border bg-card p-3">
              <span className="font-semibold">{activeGroup.name}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Quick Add Group */}
      {isAddingGroup ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter group name..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleQuickAddGroup()
              if (e.key === 'Escape') {
                setIsAddingGroup(false)
                setNewGroupName('')
              }
            }}
            onBlur={() => {
              if (!newGroupName.trim()) {
                setIsAddingGroup(false)
              }
            }}
            autoFocus
            className="flex-1"
          />
          <Button size="sm" onClick={handleQuickAddGroup} disabled={!newGroupName.trim()}>
            Add
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsAddingGroup(false)
              setNewGroupName('')
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setIsAddingGroup(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
      )}

      {/* Create Group Dialog */}
      <TaskGroupDialog
        open={createGroupDialogOpen}
        onOpenChange={setCreateGroupDialogOpen}
        onSubmit={handleCreateGroup}
      />

      {/* Edit Group Dialog */}
      <TaskGroupDialog
        open={editGroupDialogOpen}
        onOpenChange={setEditGroupDialogOpen}
        group={selectedGroup || undefined}
        onSubmit={handleUpdateGroup}
      />

      {/* Delete Group Confirmation */}
      <AlertDialog open={deleteGroupDialogOpen} onOpenChange={setDeleteGroupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the group &quot;{groupToDelete?.name}&quot;. All tasks in this
              group will be moved to the &quot;General&quot; group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground">
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Task Dialog */}
      <TaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        serviceCallId={serviceCallId}
        defaultGroupId={createTaskGroupId || undefined}
      />

      {/* Complete All Tasks Confirmation */}
      <AlertDialog open={completeAllDialogOpen} onOpenChange={setCompleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete All Tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {incompleteTasks.length} task(s) as completed. This action
              will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Move all &quot;To Do&quot; tasks through &quot;In Progress&quot; to &quot;Completed&quot;</li>
                <li>Move all &quot;In Progress&quot; tasks to &quot;Completed&quot;</li>
              </ul>
              <p className="mt-2">Are you sure you want to continue?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCompleteAllTasks}>
              Complete All Tasks
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
