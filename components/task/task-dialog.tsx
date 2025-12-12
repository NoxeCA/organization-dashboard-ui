'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useData } from '@/context/data-context'
import type { Task } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assignedEmployees: z.array(z.string()).min(1, 'At least one employee must be assigned'),
  estimatedHours: z.number().positive('Estimated hours must be positive').optional().or(z.literal(undefined)),
  groupId: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  serviceCallId: string
  task?: Task
  defaultGroupId?: string
}

export function TaskDialog({ open, onOpenChange, serviceCallId, task, defaultGroupId }: TaskDialogProps) {
  const { employees, addTask, updateTask, getTaskGroupsForServiceCall } = useData()

  const groups = getTaskGroupsForServiceCall(serviceCallId)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      assignedEmployees: task?.assignedEmployees || [],
      estimatedHours: task?.estimatedHours || undefined,
      groupId: task?.groupId || defaultGroupId || undefined,
    },
  })

  const onSubmit = (data: TaskFormValues) => {
    try {
      if (task) {
        updateTask(task.id, data)
        toast.success('Task updated successfully')
      } else {
        addTask(serviceCallId, data)
        toast.success('Task created successfully')
      }
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {task ? 'Update task details below.' : 'Create a new task for this service call.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Replace network switch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide additional details about the task..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {groups.length > 0 && (
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: group.color }}
                              />
                              {group.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Optional: Assign this task to a group
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="assignedEmployees"
              render={() => (
                <FormItem>
                  <FormLabel>Assigned Employees *</FormLabel>
                  <FormDescription>
                    Select at least one employee to assign to this task
                  </FormDescription>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-3">
                    {employees.map((employee) => (
                      <FormField
                        key={employee.id}
                        control={form.control}
                        name="assignedEmployees"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={employee.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(employee.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, employee.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== employee.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                <div>
                                  <div className="font-medium">{employee.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {employee.role}
                                  </div>
                                </div>
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.25"
                      placeholder="e.g., 4"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const val = e.target.value
                        field.onChange(val === '' ? undefined : parseFloat(val))
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Enter the estimated hours for this task
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
