'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { TimeEntryDialog } from './time-entry-dialog'
import { MaterialDialog } from './material-dialog'
import { formatCurrency, formatDate, TASK_STATUS_OPTIONS, TASK_TRANSITIONS, RATE_TYPE_OPTIONS, RATE_MULTIPLIERS } from '@/lib/constants'
import type { Task, TimeEntry, MaterialUsage, TaskStatus } from '@/lib/types'
import { ChevronDown, Clock, Package, Plus, Trash2 } from 'lucide-react'
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
  } = useData()

  const [timeDialogOpen, setTimeDialogOpen] = useState(false)
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false)
  const [deleteTimeId, setDeleteTimeId] = useState<string | null>(null)
  const [deleteMaterialId, setDeleteMaterialId] = useState<string | null>(null)

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

  const getEmployeeName = (employeeId: string) => {
    return employees.find(e => e.id === employeeId)?.name || 'Unknown'
  }

  const getRateLabel = (rateType: string) => {
    return RATE_TYPE_OPTIONS.find(r => r.value === rateType)?.label || rateType
  }

  const calculateTimeEntryCost = (entry: TimeEntry) => {
    const employee = employees.find(e => e.id === entry.employeeId)
    if (!employee) return 0
    const multiplier = RATE_MULTIPLIERS[entry.rateType] || 1
    return entry.hours * employee.hourlyRate * multiplier
  }

  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
  const totalLaborCost = timeEntries.reduce((sum, entry) => sum + calculateTimeEntryCost(entry), 0)
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

  const handleDeleteMaterial = (id: string) => {
    deleteMaterialUsage(id)
    setDeleteMaterialId(null)
    toast.success('Material deleted')
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

        <CollapsibleContent className="mt-4 space-y-4">
          {/* Task Info */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Status</h4>
              <Select
                value={task.status}
                onValueChange={handleStatusChange}
                disabled={validTransitions.length === 0}
              >
                <SelectTrigger className="w-[180px]">
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

            <Separator />

            <div>
              <h4 className="text-sm font-semibold mb-2">Assigned Employees</h4>
              <div className="flex flex-wrap gap-2">
                {assignedEmps.map(emp => (
                  <div key={emp.id} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getInitials(emp.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.role}</div>
                    </div>
                  </div>
                ))}
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
                {timeEntries.length > 0 && (
                  <Badge variant="secondary">
                    {totalHours}h / {formatCurrency(totalLaborCost)}
                  </Badge>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => setTimeDialogOpen(true)}
                disabled={!isTaskActive}
                title={!isTaskActive ? `Cannot add time to ${task.status} task` : undefined}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Time
              </Button>
            </div>

            {timeEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                No time entries yet
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="text-sm">{formatDate(entry.date)}</TableCell>
                        <TableCell className="text-sm">{getEmployeeName(entry.employeeId)}</TableCell>
                        <TableCell className="text-sm">
                          {entry.hours}
                          {!entry.billable && (
                            <Badge variant="outline" className="ml-1 text-xs">NB</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">{getRateLabel(entry.rateType)}</TableCell>
                        <TableCell className="text-sm">{formatCurrency(calculateTimeEntryCost(entry))}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">
                          {entry.notes || '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setDeleteTimeId(entry.id)}
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

      {/* Dialogs */}
      <TimeEntryDialog
        open={timeDialogOpen}
        onOpenChange={setTimeDialogOpen}
        task={task}
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
    </>
  )
}
