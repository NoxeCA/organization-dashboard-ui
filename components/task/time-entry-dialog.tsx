'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { useData } from '@/context/data-context'
import { RATE_TYPE_OPTIONS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Task } from '@/lib/types'

const timeEntryFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  hours: z.number()
    .positive('Hours must be positive')
    .max(24, 'Hours cannot exceed 24'),
  rateType: z.enum(['regular', 'overtime', 'weekend', 'holiday']),
  billable: z.boolean(),
  notes: z.string().optional(),
}).refine((data) => {
  const selectedDate = new Date(data.date)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return selectedDate <= today
}, {
  message: 'Date cannot be in the future',
  path: ['date'],
})

type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>

interface TimeEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task
}

export function TimeEntryDialog({ open, onOpenChange, task }: TimeEntryDialogProps) {
  const { employees, addTimeEntry } = useData()

  // Filter employees to only those assigned to the task
  const assignedEmployees = employees.filter(emp => task.assignedEmployees.includes(emp.id))

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      employeeId: assignedEmployees[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      hours: undefined,
      rateType: 'regular',
      billable: true,
      notes: '',
    },
  })

  const onSubmit = (data: TimeEntryFormValues) => {
    try {
      addTimeEntry(task.id, data)
      toast.success('Time entry added successfully')
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error('An error occurred')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Time Entry</DialogTitle>
          <DialogDescription>
            Log time for {task.title}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assignedEmployees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} - {emp.role}
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
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
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
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.25"
                        min="0.25"
                        max="24"
                        placeholder="e.g., 2.5"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          field.onChange(val === '' ? undefined : parseFloat(val))
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rateType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rate Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select rate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {RATE_TYPE_OPTIONS.map((option) => (
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
            </div>

            <FormField
              control={form.control}
              name="billable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Billable
                    </FormLabel>
                    <FormDescription>
                      Check if this time should be billed to the customer
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this time entry..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Add Time Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
