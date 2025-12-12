'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { CalendarIcon, Clock, Play, Timer } from 'lucide-react'
import { format } from 'date-fns'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useIsMobile } from '@/hooks/use-mobile'
import { DurationInput } from './duration-input'
import { TimeRangePicker } from '@/components/ui/time-picker'
import {
  TIME_PRESETS,
  RATE_TYPE_OPTIONS_WITH_MULTIPLIER,
  RATE_MULTIPLIERS,
  formatCurrency,
  formatDuration,
  timeToHours,
  getCurrentTime,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Task, Employee, TimeEntry, RateType, TimeEntryFormData } from '@/lib/types'

const timeEntryFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  hours: z.number().positive('Hours must be positive').max(24, 'Hours cannot exceed 24'),
  rateType: z.enum(['regular', 'overtime', 'weekend', 'holiday']),
  billable: z.boolean(),
  notes: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  entryMode: z.enum(['manual', 'duration', 'start_end', 'timer']).optional(),
})

type FormValues = z.infer<typeof timeEntryFormSchema>

interface TimeEntrySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
  employees: Employee[]
  entry?: TimeEntry // For edit mode
  onSubmit: (data: TimeEntryFormData) => void
  onStartTimer?: (config: {
    employeeId: string
    rateType: RateType
    billable: boolean
    notes?: string
  }) => void
  isTimerRunning?: boolean
}

export function TimeEntrySheet({
  open,
  onOpenChange,
  task,
  employees,
  entry,
  onSubmit,
  onStartTimer,
  isTimerRunning,
}: TimeEntrySheetProps) {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = React.useState<string>('quick')
  const isEditMode = !!entry

  // Memoize assigned employees to prevent infinite re-renders
  const assignedEmployees = React.useMemo(
    () => employees.filter(emp => task.assignedEmployees.includes(emp.id)),
    [employees, task.assignedEmployees]
  )

  // Get default employee ID (memoized)
  const defaultEmployeeId = React.useMemo(
    () => assignedEmployees[0]?.id || '',
    [assignedEmployees]
  )

  const form = useForm<FormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      employeeId: entry?.employeeId || defaultEmployeeId,
      date: entry?.date || new Date().toISOString().split('T')[0],
      hours: entry?.hours || 0,
      rateType: entry?.rateType || 'regular',
      billable: entry?.billable ?? true,
      notes: entry?.notes || '',
      startTime: entry?.startTime || '09:00',
      endTime: entry?.endTime || '17:00',
      entryMode: entry?.entryMode || 'duration',
    },
  })

  // Reset form when entry or open state changes
  React.useEffect(() => {
    if (!open) return

    const currentTime = getCurrentTime()
    if (entry) {
      form.reset({
        employeeId: entry.employeeId,
        date: entry.date,
        hours: entry.hours,
        rateType: entry.rateType,
        billable: entry.billable,
        notes: entry.notes || '',
        startTime: entry.startTime || currentTime,
        endTime: entry.endTime || currentTime,
        entryMode: entry.entryMode || 'duration',
      })
      setActiveTab(entry.entryMode === 'start_end' ? 'time' : 'duration')
    } else {
      form.reset({
        employeeId: defaultEmployeeId,
        date: new Date().toISOString().split('T')[0],
        hours: 0,
        rateType: 'regular',
        billable: true,
        notes: '',
        startTime: currentTime,
        endTime: currentTime,
        entryMode: 'duration',
      })
      setActiveTab('quick')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entry?.id, defaultEmployeeId])

  // Calculate cost for preview
  const watchedValues = form.watch()
  const selectedEmployee = employees.find(e => e.id === watchedValues.employeeId)
  const multiplier = RATE_MULTIPLIERS[watchedValues.rateType] || 1
  const estimatedCost = selectedEmployee && watchedValues.hours > 0
    ? watchedValues.hours * selectedEmployee.hourlyRate * multiplier
    : 0

  // Update hours when start/end time changes
  const handleTimeRangeChange = (start: string, end: string) => {
    form.setValue('startTime', start)
    form.setValue('endTime', end)
    const hours = timeToHours(start, end)
    if (hours > 0) {
      form.setValue('hours', Math.round(hours * 4) / 4) // Round to nearest 0.25
    }
  }

  const handleQuickPreset = (hours: number) => {
    form.setValue('hours', hours)
    form.setValue('entryMode', 'duration')
  }

  const handleSubmit = (data: FormValues) => {
    const entryMode = activeTab === 'time' ? 'start_end' : activeTab === 'timer' ? 'timer' : 'duration'
    onSubmit({
      ...data,
      entryMode,
    } as TimeEntryFormData)
    onOpenChange(false)
    form.reset()
  }

  const handleStartTimer = () => {
    if (!onStartTimer) return
    const data = form.getValues()
    onStartTimer({
      employeeId: data.employeeId,
      rateType: data.rateType,
      billable: data.billable,
      notes: data.notes,
    })
    onOpenChange(false)
    toast.success('Timer started')
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col h-full">
        {/* Common Fields */}
        <div className="px-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Employee */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignedEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'MMM d')
                          ) : (
                            <span>Pick date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date.toISOString().split('T')[0])
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Rate Type & Billable */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="rateType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {RATE_TYPE_OPTIONS_WITH_MULTIPLIER.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="billable"
              render={({ field }) => (
                <FormItem className="flex flex-col justify-end">
                  <div className="flex items-center gap-2 h-10 px-3 border rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!mt-0 cursor-pointer">Billable</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tabs for entry mode */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col mt-4">
          <TabsList className="mx-4 grid grid-cols-4">
            <TabsTrigger value="quick" className="text-xs">Quick</TabsTrigger>
            <TabsTrigger value="duration" className="text-xs">Duration</TabsTrigger>
            <TabsTrigger value="time" className="text-xs">Start/End</TabsTrigger>
            <TabsTrigger value="timer" className="text-xs" disabled={isEditMode}>Timer</TabsTrigger>
          </TabsList>

          {/* Quick Tab */}
          <TabsContent value="quick" className="flex-1 px-4 py-4 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {TIME_PRESETS.map((preset) => (
                <Button
                  key={preset.value}
                  type="button"
                  variant={watchedValues.hours === preset.value ? 'default' : 'outline'}
                  className="min-h-[48px]"
                  onClick={() => handleQuickPreset(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            {watchedValues.hours > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Selected: {formatDuration(watchedValues.hours)}
              </p>
            )}
          </TabsContent>

          {/* Duration Tab */}
          <TabsContent value="duration" className="flex-1 px-4 py-4">
            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <DurationInput
                    value={field.value}
                    onChange={field.onChange}
                    showPresets={false}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* Start/End Tab */}
          <TabsContent value="time" className="flex-1 px-4 py-4">
            <div className="flex flex-col items-center gap-4">
              <TimeRangePicker
                startTime={watchedValues.startTime}
                endTime={watchedValues.endTime}
                onStartTimeChange={(start) => handleTimeRangeChange(start, watchedValues.endTime || getCurrentTime())}
                onEndTimeChange={(end) => handleTimeRangeChange(watchedValues.startTime || getCurrentTime(), end)}
              />
              {watchedValues.hours > 0 && (
                <p className="text-sm text-muted-foreground">
                  Duration: {formatDuration(watchedValues.hours)}
                </p>
              )}
            </div>
          </TabsContent>

          {/* Timer Tab */}
          <TabsContent value="timer" className="flex-1 px-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <Timer className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Start a timer to track your work in real-time.
                <br />
                The timer will persist even if you close this dialog.
              </p>
              <Button
                type="button"
                size="lg"
                className="min-w-[150px]"
                onClick={handleStartTimer}
                disabled={isTimerRunning || !watchedValues.employeeId}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
              {isTimerRunning && (
                <p className="text-xs text-amber-600">
                  A timer is already running
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Notes */}
        <div className="px-4 pb-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add notes..."
                    rows={2}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Cost Preview & Actions */}
        <div className="mt-auto border-t bg-muted/30 p-4 space-y-3">
          {estimatedCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Cost:</span>
              <span className="font-semibold">{formatCurrency(estimatedCost)}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={activeTab === 'timer' || watchedValues.hours <= 0}
            >
              {isEditMode ? 'Update' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )

  const title = isEditMode ? 'Edit Time Entry' : 'Add Time Entry'
  const description = `Log time for ${task.title}`

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 flex flex-col max-h-[85vh]">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}
