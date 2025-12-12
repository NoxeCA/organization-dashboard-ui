'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { useData } from '@/context/data-context'
import { TASK_STATUS_COLORS } from '@/lib/constants'
import type { Task } from '@/lib/types'
import { Clock, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onClick?: () => void
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { employees, getTimeEntriesForTask, getMaterialsForTask } = useData()

  const timeEntries = getTimeEntriesForTask(task.id)
  const materials = getMaterialsForTask(task.id)

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
  const assignedEmps = employees.filter(emp => task.assignedEmployees.includes(emp.id))

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const statusLabel = TASK_STATUS_COLORS[task.status]
    ? task.status.replace('_', ' ').split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    : task.status

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${onClick ? 'hover:border-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="py-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm leading-tight truncate">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {task.description}
              </p>
            )}
          </div>
          <Badge className={cn(TASK_STATUS_COLORS[task.status], "text-[10px] px-1.5 py-0.5")}>
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 px-4">
        <div className="flex items-center justify-between gap-3">
          {/* Assigned Employees */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {assignedEmps.slice(0, 3).map(emp => (
                <Avatar key={emp.id} className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px] bg-primary/10">
                    {getInitials(emp.name)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {assignedEmps.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-[10px] bg-muted">
                    +{assignedEmps.length - 3}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {totalHours > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{totalHours}h</span>
              </div>
            )}
            {materials.length > 0 && (
              <div className="flex items-center gap-1">
                <Package className="h-3.5 w-3.5" />
                <span>{materials.length}</span>
              </div>
            )}
          </div>
        </div>

        {task.estimatedHours && task.estimatedHours > 0 && (
          <div className="mt-2 space-y-0.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">
                {totalHours.toFixed(1)}h / {task.estimatedHours}h
              </span>
              <span className={cn(
                "font-medium",
                totalHours > task.estimatedHours ? 'text-orange-600 dark:text-orange-400' : 'text-muted-foreground'
              )}>
                {Math.round((totalHours / task.estimatedHours) * 100)}%
              </span>
            </div>
            <Progress
              value={Math.min((totalHours / task.estimatedHours) * 100, 100)}
              className={cn(
                "h-1",
                totalHours > task.estimatedHours && "[&>div]:bg-orange-500"
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
