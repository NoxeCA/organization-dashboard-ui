'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { TaskCard } from '@/components/task/task-card'
import { TaskDialog } from '@/components/task/task-dialog'
import { TaskDetailPanel } from '@/components/task/task-detail-panel'
import { useData } from '@/context/data-context'
import { Plus, CheckCircle2, Circle, Clock, XCircle, CheckCheck } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'

interface TaskSectionProps {
  serviceCallId: string
}

export function TaskSection({ serviceCallId }: TaskSectionProps) {
  const { getTasksForServiceCall, updateTask } = useData()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [completeAllDialogOpen, setCompleteAllDialogOpen] = useState(false)

  const tasks = getTasksForServiceCall(serviceCallId)

  // Get tasks that can be completed (todo or in_progress)
  const incompleteTasks = tasks.filter(t => ['todo', 'in_progress'].includes(t.status))

  // Calculate status summary
  const statusCounts = tasks.reduce(
    (acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    },
    {} as Record<TaskStatus, number>
  )

  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId)
  }

  const handleCompleteAllTasks = () => {
    // First move all 'todo' tasks to 'in_progress', then to 'completed'
    incompleteTasks.forEach(task => {
      if (task.status === 'todo') {
        // Move to in_progress first
        updateTask(task.id, { status: 'in_progress' })
      }
      // Then move to completed
      updateTask(task.id, { status: 'completed' })
    })

    toast.success(`${incompleteTasks.length} task(s) marked as completed`)
    setCompleteAllDialogOpen(false)
  }

  return (
    <div className="space-y-3">
      {/* Header with Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold">Tasks</h3>
          <Badge variant="secondary" className="text-xs">{tasks.length} Total</Badge>
        </div>
        <div className="flex gap-2">
          {incompleteTasks.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCompleteAllDialogOpen(true)}>
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Complete All
            </Button>
          )}
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Status Summary */}
      {tasks.length > 0 && (
        <div className="flex flex-wrap gap-4 px-3 py-2 bg-muted/50 rounded-lg">
          {statusCounts.todo && (
            <div className="flex items-center gap-1.5 text-xs">
              <Circle className="h-3.5 w-3.5 text-gray-500" />
              <span className="font-medium">{statusCounts.todo}</span>
              <span className="text-muted-foreground">To Do</span>
            </div>
          )}
          {statusCounts.in_progress && (
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-medium">{statusCounts.in_progress}</span>
              <span className="text-muted-foreground">In Progress</span>
            </div>
          )}
          {statusCounts.completed && (
            <div className="flex items-center gap-1.5 text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span className="font-medium">{statusCounts.completed}</span>
              <span className="text-muted-foreground">Completed</span>
            </div>
          )}
          {statusCounts.cancelled && (
            <div className="flex items-center gap-1.5 text-xs">
              <XCircle className="h-3.5 w-3.5 text-red-500" />
              <span className="font-medium">{statusCounts.cancelled}</span>
              <span className="text-muted-foreground">Cancelled</span>
            </div>
          )}
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 bg-muted rounded-full">
              <Circle className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-0.5">No tasks yet</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Create a task to start tracking work for this service call
              </p>
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Create First Task
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="space-y-0">
              <TaskCard task={task} onClick={() => handleTaskClick(task.id)} />
              {expandedTaskId === task.id && (
                <div className="border border-t-0 rounded-b-lg px-4 pb-4 -mt-2">
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
      )}

      {/* Create Task Dialog */}
      <TaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        serviceCallId={serviceCallId}
      />

      {/* Complete All Tasks Confirmation Dialog */}
      <AlertDialog open={completeAllDialogOpen} onOpenChange={setCompleteAllDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete All Tasks?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark {incompleteTasks.length} task(s) as completed. This action will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Move all "To Do" tasks through "In Progress" to "Completed"</li>
                <li>Move all "In Progress" tasks to "Completed"</li>
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
