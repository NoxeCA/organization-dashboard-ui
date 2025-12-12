'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { useData } from '@/context/data-context'
import { TimeEntrySheet } from './time-entry-sheet'
import { TimeEntryList } from './time-entry-list'
import { TimerWidget } from './timer-widget'
import { MaterialDialog } from './material-dialog'
import { useTimer } from '@/hooks/use-timer'
import { formatCurrency, TASK_STATUS_OPTIONS, TASK_TRANSITIONS, RATE_MULTIPLIERS } from '@/lib/constants'
import type { Task, TimeEntry, MaterialUsage, TaskStatus, TimeEntryFormData, RateType } from '@/lib/types'
import { ChevronDown, Clock, Package, Plus, Trash2, Timer } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface TaskDetailPanelProps {
  task: Task
  isOpen: boolean
  onToggle: () => void
}

export function TaskDetailPanel({ task, isOpen, onToggle }: TaskDetailPanelProps) {
  const {
    employees,
    getTimeEntriesForTask,
    getMaterialsForTask,
    deleteTimeEntry,
    deleteMaterialUsage,
    updateTask,
    deleteTask,
    addTimeEntry,
    updateTimeEntry,
  } = useData()

  // Timer hook
  const {
    activeTimer,
    elapsedSeconds,
    formattedTime,
    isRunning: isTimerRunning,
    startTimer,
    stopTimer,
    cancelTimer,
  } = useTimer()

  const [timeSheetOpen, setTimeSheetOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | undefined>(undefined)
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [deleteTimeId, setDeleteTimeId] = useState<string | null>(null)
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null)
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false)

  // Edit states for fields that don't auto-save on every keystroke
  const [description, setDescription] = useState(task.description || '')
  
  // Sync local state with prop
  useEffect(() => {
    setDescription(task.description || '')
  }, [task.description])

  const timeEntries = getTimeEntriesForTask(task.id)
  const materials = getMaterialsForTask(task.id)
  const assignedEmps = employees.filter(emp => task.assignedEmployees.includes(emp.id))

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  const calculateTimeEntryCost = (entry: TimeEntry) => {
    const employee = employees.find(e => e.id === entry.employeeId)
    if (!employee) return 0
    const multiplier = RATE_MULTIPLIERS[entry.rateType] || 1
    return entry.hours * employee.hourlyRate * multiplier
  }

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
  const totalLaborCost = timeEntries.reduce((sum, entry) => sum + calculateTimeEntryCost(entry), 0)

  // Check if timer is running for this task
  const isTimerForThisTask = activeTimer?.taskId === task.id
  const totalMaterialCost = materials.reduce((sum, mat) => {
    return sum + (mat.unitCost ? mat.quantity * mat.unitCost : 0)
  }, 0)

  // Check if task is active (can have time/materials added)
  const isTaskActive = ['todo', 'in_progress'].includes(task.status)

  // Get valid status transitions for this task
  const validTransitions = TASK_TRANSITIONS[task.status]
  const availableStatusOptions = TASK_STATUS_OPTIONS.filter(
    option => option.value === task.status || validTransitions.includes(option.value as TaskStatus)
  )

  const handleStatusChange = (newStatus: string) => {
    if (!validTransitions.includes(newStatus as TaskStatus)) {
      toast.error(`Cannot change task from "${task.status}" to "${newStatus}"`)
      return
    }
    updateTask(task.id, { status: newStatus as Task['status'] })
    toast.success('Task status updated')
  }

  const handleDeleteTimeEntry = (id: string) => {
    deleteTimeEntry(id)
    setDeleteTimeId(null)
    toast.success('Time entry deleted')
  }

  const handleTimeEntrySubmit = (data: TimeEntryFormData) => {
    if (editingEntry) {
      // Edit mode
      updateTimeEntry(editingEntry.id, data)
      toast.success('Time entry updated')
    } else {
      // Add mode
      addTimeEntry(task.id, data)
      toast.success('Time entry added')
    }
    setEditingEntry(undefined)
  }

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setTimeSheetOpen(true)
  }

  const handleStartTimer = (config: {
    employeeId: string
    rateType: RateType
    billable: boolean
    notes?: string
  }) => {
    startTimer({ ...config, taskId: task.id })
  }

  const handleStopTimer = () => {
    const entryData = stopTimer()
    if (entryData) {
      addTimeEntry(task.id, entryData)
      toast.success('Time entry saved')
    }
  }

  const handleOpenTimeSheet = () => {
    setEditingEntry(undefined)
    setTimeSheetOpen(true)
  }

  const handleDeleteMaterial = (id: string) => {
    deleteMaterialUsage(id)
    setDeleteMaterialId(null)
    toast.success('Material deleted')
  }

  const handleDeleteTask = () => {
    deleteTask(task.id)
    toast.success('Task deleted')
    setDeleteTaskDialogOpen(false)
  }

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      updateTask(task.id, { description })
    }
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between mt-2 px-2"
          >
            <span className="text-sm font-medium">
              {isOpen ? 'Hide Details' : 'Show Details'}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-6">
          {/* Header Actions */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
              onClick={() => setDeleteTaskDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Task
            </Button>
          </div>

          {/* Task Info */}
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                value={task.title}
                onChange={(e) => updateTask(task.id, { title: e.target.value })}
                className="font-medium"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={task.status}
                  onValueChange={handleStatusChange}
                  disabled={validTransitions.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStatusOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        disabled={option.value === task.status}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Assigned Employees</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-1 border rounded-md bg-muted/20">
                  {assignedEmps.length === 0 ? (
                     <span className="text-sm text-muted-foreground p-1">No employees assigned</span>
                  ) : (
                    assignedEmps.map(emp => (
                      <div key={emp.id} className="flex items-center gap-2 bg-background border px-2 py-1 rounded-md shadow-sm">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">
                            {getInitials(emp.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium">{emp.name}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Time Entries Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">Time Entries</h4>
                {isTimerForThisTask && (
                  <Badge variant="outline" className="animate-pulse border-red-200 text-red-600 dark:border-red-900 dark:text-red-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-1" />
                    Recording
                  </Badge>
                )}
                {timeEntries.length > 0 && !isTimerForThisTask && (
                  <Badge variant="secondary">
                    {totalHours}h / {formatCurrency(totalLaborCost)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenTimeSheet}
                  disabled={!isTaskActive || isTimerRunning}
                  title={isTimerRunning ? 'Stop the running timer first' : !isTaskActive ? `Cannot add time to ${task.status} task` : 'Start a timer'}
                >
                  <Timer className="h-4 w-4 mr-1" />
                  Timer
                </Button>
                <Button
                  size="sm"
                  onClick={handleOpenTimeSheet}
                  disabled={!isTaskActive}
                  title={!isTaskActive ? `Cannot add time to ${task.status} task` : undefined}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time
                </Button>
              </div>
            </div>

            {/* Timer Widget */}
            {isTimerForThisTask && (
              <TimerWidget
                activeTimer={activeTimer}
                elapsedSeconds={elapsedSeconds}
                formattedTime={formattedTime}
                onStop={handleStopTimer}
                onCancel={cancelTimer}
                taskTitle={task.title}
                className="mb-3"
              />
            )}

            {/* Time Entry List */}
            <TimeEntryList
              entries={timeEntries}
              employees={employees}
              onEdit={handleEditTimeEntry}
              onDelete={(id) => setDeleteTimeId(id)}
            />
          </div>

          <Separator />

          {/* Materials Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-semibold">Materials</h4>
                {materials.length > 0 && totalMaterialCost > 0 && (
                  <Badge variant="secondary">
                    {formatCurrency(totalMaterialCost)}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => setMaterialDialogOpen(true)}
                disabled={!isTaskActive}
                title={!isTaskActive ? `Cannot add material to ${task.status} task` : undefined}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Material
              </Button>
            </div>

            {materials.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                No materials used yet
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="text-sm font-medium">{material.materialName}</TableCell>
                        <TableCell className="text-sm">{material.quantity}</TableCell>
                        <TableCell className="text-sm">{material.unit}</TableCell>
                        <TableCell className="text-sm">
                          {material.unitCost ? formatCurrency(material.unitCost) : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {material.unitCost
                            ? formatCurrency(material.quantity * material.unitCost)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          <Badge variant="outline">
                            {material.source.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteMaterialId(material.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Summary */}
          {(totalHours > 0 || totalMaterialCost > 0) && (
            <>
              <Separator />
              <div className="bg-muted/50 rounded-md p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Labor:</span>
                  <span className="font-medium">{totalHours}h / {formatCurrency(totalLaborCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Materials:</span>
                  <span className="font-medium">{formatCurrency(totalMaterialCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total Cost:</span>
                  <span>{formatCurrency(totalLaborCost + totalMaterialCost)}</span>
                </div>
              </div>
            </>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Time Entry Sheet */}
      <TimeEntrySheet
        open={timeSheetOpen}
        onOpenChange={(open) => {
          setTimeSheetOpen(open)
          if (!open) setEditingEntry(undefined)
        }}
        task={task}
        employees={employees}
        entry={editingEntry}
        onSubmit={handleTimeEntrySubmit}
        onStartTimer={handleStartTimer}
        isTimerRunning={isTimerRunning}
      />

      <MaterialDialog
        open={materialDialogOpen}
        onOpenChange={setMaterialDialogOpen}
        task={task}
      />

      {/* Delete Time Entry Confirmation */}
      <AlertDialog open={!!deleteTimeId} onOpenChange={() => setDeleteTimeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the time entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTimeId && handleDeleteTimeEntry(deleteTimeId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Material Confirmation */}
      <AlertDialog open={!!deleteMaterialId} onOpenChange={() => setDeleteMaterialId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Material?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the material usage record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMaterialId && handleDeleteMaterial(deleteMaterialId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Task Confirmation */}
      <AlertDialog open={deleteTaskDialogOpen} onOpenChange={setDeleteTaskDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task "{task.title}" 
              along with all its time entries and material records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTask}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
