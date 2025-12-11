'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from '@/components/task/task-card'
import { TaskDialog } from '@/components/task/task-dialog'
import { TaskDetailPanel } from '@/components/task/task-detail-panel'
import { useData } from '@/context/data-context'
import { Plus, CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/types'

interface TaskSectionProps {
  serviceCallId: string
}

export function TaskSection({ serviceCallId }: TaskSectionProps) {
  const { getTasksForServiceCall } = useData()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  const tasks = getTasksForServiceCall(serviceCallId)

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

  return (
    <div className="space-y-4">
      {/* Header with Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Tasks</h3>
          <Badge variant="secondary">{tasks.length} Total</Badge>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </Button>
      </div>

      {/* Status Summary */}
      {tasks.length > 0 && (
        <div className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg">
          {statusCounts.todo && (
            <div className="flex items-center gap-2 text-sm">
              <Circle className="h-4 w-4 text-gray-500" />
              <span className="font-medium">{statusCounts.todo}</span>
              <span className="text-muted-foreground">To Do</span>
            </div>
          )}
          {statusCounts.in_progress && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-medium">{statusCounts.in_progress}</span>
              <span className="text-muted-foreground">In Progress</span>
            </div>
          )}
          {statusCounts.completed && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="font-medium">{statusCounts.completed}</span>
              <span className="text-muted-foreground">Completed</span>
            </div>
          )}
          {statusCounts.cancelled && (
            <div className="flex items-center gap-2 text-sm">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="font-medium">{statusCounts.cancelled}</span>
              <span className="text-muted-foreground">Cancelled</span>
            </div>
          )}
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 bg-muted rounded-full">
              <Circle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-semibold mb-1">No tasks yet</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Create a task to start tracking work for this service call
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create First Task
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
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
    </div>
  )
}
