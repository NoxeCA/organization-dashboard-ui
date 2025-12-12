'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { TaskGroupList } from './task-group-list'
import { TaskGroupDialog } from './task-group-dialog'
import { TaskListRow } from '@/components/task/task-list-row'
import { TaskDialog } from '@/components/task/task-dialog'
import { useData } from '@/context/data-context'
import { DEFAULT_GROUP_COLOR, TASK_STATUS_SOLID_COLORS } from '@/lib/constants'
import type { Task, TaskGroup, TaskGroupFormData } from '@/lib/types'
import { Plus, CheckCheck, Circle, Clock, CheckCircle2, XCircle, FolderPlus, GripVertical } from 'lucide-react'
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
      {/* Header with improved spacing and hierarchy */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">Tasks</h3>
            <span className="flex items-center justify-center bg-muted text-muted-foreground text-xs font-medium h-5 min-w-5 px-1.5 rounded-full">
              {allTasks.length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Manage service tasks and phases</p>
        </div>
        <div className="flex items-center gap-2">
          {incompleteTasks.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setCompleteAllDialogOpen(true)}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Complete All
            </Button>
          )}
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={() => setCreateGroupDialogOpen(true)}
          >
            <FolderPlus className="h-3.5 w-3.5 mr-1.5" />
            New Group
          </Button>
        </div>
      </div>

      {/* Modern Status Pills */}
      {allTasks.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-4">
          {statusCounts.todo > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors hover:bg-slate-200 dark:hover:bg-slate-700">
              <Circle className="h-3 w-3 fill-current opacity-60" />
              <span>{statusCounts.todo} To Do</span>
            </div>
          )}
          {statusCounts.in_progress > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/30">
              <Clock className="h-3 w-3 fill-current opacity-60" />
              <span>{statusCounts.in_progress} In Progress</span>
            </div>
          )}
          {statusCounts.completed > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/30">
              <CheckCircle2 className="h-3 w-3 fill-current opacity-60" />
              <span>{statusCounts.completed} Completed</span>
            </div>
          )}
          {statusCounts.cancelled > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-medium transition-colors hover:bg-red-100 dark:hover:bg-red-900/30">
              <XCircle className="h-3 w-3 fill-current opacity-60" />
              <span>{statusCounts.cancelled} Cancelled</span>
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
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {groups.map((group) => {
                const groupTasks = getTasksForGroup(group.id)
                return (
                  <TaskGroupList
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
          </AnimatePresence>
        </SortableContext>

        {/* Drag Overlay - Enhanced with better styling */}
        <DragOverlay dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}>
          {activeTask && (
            <motion.div
              initial={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              animate={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
              className="bg-card rounded-lg border-2 border-primary/20 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-3 py-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm">{activeTask.title}</span>
                <div className="ml-auto">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      backgroundColor: TASK_STATUS_SOLID_COLORS[activeTask.status].bg,
                      color: TASK_STATUS_SOLID_COLORS[activeTask.status].text,
                    }}
                  >
                    {activeTask.status === 'in_progress' ? 'Working' : activeTask.status}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
          {activeGroup && (
            <motion.div
              initial={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
              animate={{ scale: 1.02, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
              className="rounded-lg border-2 border-primary/20 bg-card p-3"
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div
                  className="h-4 w-1 rounded-full"
                  style={{ backgroundColor: activeGroup.color }}
                />
                <span className="font-semibold">{activeGroup.name}</span>
              </div>
            </motion.div>
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
          className="w-full justify-center text-muted-foreground border-dashed h-12 hover:bg-muted/50 hover:text-foreground"
          onClick={() => setIsAddingGroup(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Group
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
