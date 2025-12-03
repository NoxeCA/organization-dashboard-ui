"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import {
  type Task,
  type TaskStatus,
  type Employee,
  type Site,
  TASK_STATUSES,
} from "@/lib/types/service-call";
import { mockEmployees, mockSites } from "@/lib/mock-service-calls";

const taskFormSchema = z.object({
  name: z.string().min(1, "Task name is required"),
  description: z.string().optional(),
  status: z.enum(["backlog", "todo", "in_progress", "done"]),
  siteId: z.string().min(1, "Site is required"),
  plannedTime: z.coerce.number().min(0).optional(),
  dueDate: z.date().optional(),
  assignedEmployeeIds: z.array(z.string()),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskDialogProps {
  serviceCallId: string;
  sites: Site[];
  employees: Employee[];
  onTaskCreate?: (task: Partial<Task>) => void;
  trigger?: React.ReactNode;
}

export function TaskDialog({
  serviceCallId,
  sites = mockSites,
  employees = mockEmployees,
  onTaskCreate,
  trigger,
}: TaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "todo",
      siteId: sites[0]?.id || "",
      plannedTime: undefined,
      dueDate: undefined,
      assignedEmployeeIds: [],
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    const newTask: Partial<Task> = {
      id: `task-${Date.now()}`,
      name: data.name,
      description: data.description,
      status: data.status,
      column: data.status,
      serviceCallId,
      siteId: data.siteId,
      site: sites.find((s) => s.id === data.siteId),
      assignedEmployees: employees.filter((e) =>
        data.assignedEmployeeIds.includes(e.id)
      ),
      plannedTime: data.plannedTime,
      dueDate: data.dueDate?.toISOString().split("T")[0],
      timeEntries: [],
      materials: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onTaskCreate?.(newTask);
    form.reset();
    setSelectedEmployees([]);
    setOpen(false);
  };

  const toggleEmployee = (employeeId: string) => {
    const current = form.getValues("assignedEmployeeIds");
    if (current.includes(employeeId)) {
      form.setValue(
        "assignedEmployeeIds",
        current.filter((id) => id !== employeeId)
      );
    } else {
      form.setValue("assignedEmployeeIds", [...current, employeeId]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to this service call. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Replace faulty switch" {...field} />
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
                      placeholder="Describe the task in detail..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_STATUSES.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${status.color}`} />
                              {status.name}
                            </div>
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
                name="siteId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plannedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Planned Hours</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g., 4"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "MMM d, yyyy")
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
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assignedEmployeeIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Employees</FormLabel>
                  <FormDescription>
                    Click to select employees for this task
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {employees.map((employee) => {
                      const isSelected = field.value.includes(employee.id);
                      return (
                        <button
                          key={employee.id}
                          type="button"
                          onClick={() => toggleEmployee(employee.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-border"
                          )}
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={employee.avatar} alt={employee.name} />
                            <AvatarFallback className="text-[8px]">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.name}</span>
                          {isSelected && <X className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
