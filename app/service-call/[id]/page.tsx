"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Filter,
  FolderOpen,
  LayoutGrid,
  List,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


import {
  getServiceCallById,
  mockEmployees,
  mockSites,
} from "@/lib/mock-service-calls";
import { TaskDialog } from "@/components/service-call/task-dialog";
import { TaskDetailSheet } from "@/components/service-call/task-detail-sheet";
import { CommunicationThread } from "@/components/service-call/communication-thread";
import { TaskGroupDialog } from "@/components/service-call/task-group-dialog";
import { TaskCard, findTaskGroup } from "@/components/service-call/task-card";
import {
  SERVICE_CALL_STATUSES,
  TASK_STATUSES,
  PRIORITIES,
  type ServiceCall,
  type Task,
  type TaskGroup,
  type TaskStatus,
  type ServiceCallStatus,
  type Priority,
} from "@/lib/types/service-call";

// Badge helpers
const getStatusBadge = (status: ServiceCallStatus) => {
  const config = SERVICE_CALL_STATUSES.find((s) => s.id === status);
  const variants: Record<ServiceCallStatus, "default" | "secondary" | "destructive" | "outline"> = {
    open: "default",
    in_progress: "secondary",
    resolved: "default",
    invoiced: "outline",
    closed: "secondary",
  };
  return (
    <Badge variant={variants[status]} className="capitalize">
      <span className={`mr-1.5 h-2 w-2 rounded-full ${config?.color || "bg-gray-500"}`} />
      {config?.name || status}
    </Badge>
  );
};

const getPriorityBadge = (priority: Priority) => {
  const config = PRIORITIES.find((p) => p.id === priority);
  const variants: Record<Priority, "default" | "secondary" | "destructive" | "outline"> = {
    low: "outline",
    medium: "secondary",
    high: "default",
    urgent: "destructive",
  };
  return (
    <Badge variant={variants[priority]} className="capitalize">
      {config?.name || priority}
    </Badge>
  );
};

// Group color mapping
const GROUP_COLORS: Record<string, string> = {
  "tg-diag": "bg-blue-500",
  "tg-repair": "bg-orange-500",
  "tg-config": "bg-purple-500",
  "tg-1": "bg-emerald-500",
  "tg-2": "bg-pink-500",
};

function getGroupColor(groupId: string): string {
  return GROUP_COLORS[groupId] || "bg-slate-500";
}

// Task table view
function TaskTableView({
  tasks,
  taskGroups,
  groupFilter,
  onTaskClick,
  onStatusChange,
}: {
  tasks: Task[];
  taskGroups: TaskGroup[];
  groupFilter: string;
  onTaskClick: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}) {
  // Filter tasks by group if filter is set
  const filteredTasks = groupFilter === "all"
    ? tasks
    : groupFilter === "ungrouped"
      ? tasks.filter(t => !findTaskGroup(t, taskGroups))
      : tasks.filter(t => findTaskGroup(t, taskGroups)?.id === groupFilter);

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm">
          {groupFilter !== "all" ? "Try changing the group filter" : "Create a task to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Task</TableHead>
            <TableHead className="w-[120px]">Group</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[150px]">Assignees</TableHead>
            <TableHead className="w-[100px]">Due Date</TableHead>
            <TableHead className="w-[80px] text-right">Hours</TableHead>
            <TableHead className="w-[80px] text-right">Materials</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.map((task) => {
            const group = findTaskGroup(task, taskGroups);
            const totalHours = task.timeEntries.reduce((sum, te) => sum + te.hours, 0);
            const statusConfig = TASK_STATUSES.find(s => s.id === task.status);

            return (
              <TableRow
                key={task.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onTaskClick(task)}
              >
                {/* Task Name & Description */}
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-medium text-sm">{task.name}</p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Group */}
                <TableCell>
                  {group ? (
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${getGroupColor(group.id)}`} />
                      <span className="text-xs">{group.name}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Status with dropdown */}
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-muted transition-colors">
                        <span className={`h-2 w-2 rounded-full ${statusConfig?.color}`} />
                        <span className="text-xs">{statusConfig?.name}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {TASK_STATUSES.map((status) => (
                        <DropdownMenuItem
                          key={status.id}
                          onClick={() => onStatusChange(task, status.id)}
                          className={task.status === status.id ? "bg-muted" : ""}
                        >
                          <span className={`h-2 w-2 rounded-full mr-2 ${status.color}`} />
                          {status.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

                {/* Assignees */}
                <TableCell>
                  {task.assignedEmployees.length > 0 ? (
                    <div className="flex items-center gap-1">
                      <div className="flex -space-x-1.5">
                        {task.assignedEmployees.slice(0, 3).map((emp) => (
                          <Avatar
                            key={emp.id}
                            className="h-6 w-6 border-2 border-background"
                          >
                            <AvatarImage src={emp.avatar} alt={emp.name} />
                            <AvatarFallback className="text-[9px]">
                              {emp.name.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      {task.assignedEmployees.length > 3 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          +{task.assignedEmployees.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Due Date */}
                <TableCell>
                  {task.dueDate ? (
                    <span className="text-xs">
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>

                {/* Hours */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {totalHours > 0 ? (
                      <>
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">
                          {totalHours}h
                          {task.plannedTime && (
                            <span className="text-muted-foreground">/{task.plannedTime}h</span>
                          )}
                        </span>
                      </>
                    ) : task.plannedTime ? (
                      <span className="text-xs text-muted-foreground">
                        0/{task.plannedTime}h
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>

                {/* Materials */}
                <TableCell className="text-right">
                  {task.materials.length > 0 ? (
                    <div className="flex items-center justify-end gap-1">
                      <Package className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{task.materials.length}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Financial summary
function FinancialSummary({ serviceCall }: { serviceCall: ServiceCall }) {
  const summary = serviceCall.summary;

  if (!summary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Estimated Cost</p>
            <p className="text-lg font-medium">${summary.estimatedCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Real Cost</p>
            <p className="text-lg font-medium">${summary.realCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Est. Sell Price</p>
            <p className="text-lg font-medium">${summary.estimatedSellPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Real Sell Price</p>
            <p className="text-lg font-medium">${summary.realSellPrice.toLocaleString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-muted-foreground">Predicted Material</p>
            <p className="text-lg font-medium">${summary.predictedMaterial.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Card-based view grouped by status
function TaskCardView({
  tasks,
  taskGroups,
  groupFilter,
  onTaskClick,
  onStatusChange,
}: {
  tasks: Task[];
  taskGroups: TaskGroup[];
  groupFilter: string;
  onTaskClick: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}) {
  // Filter tasks by group if filter is set
  const filteredTasks = groupFilter === "all"
    ? tasks
    : groupFilter === "ungrouped"
      ? tasks.filter(t => !findTaskGroup(t, taskGroups))
      : tasks.filter(t => findTaskGroup(t, taskGroups)?.id === groupFilter);

  // Group tasks by status
  const tasksByStatus = TASK_STATUSES.reduce((acc, status) => {
    acc[status.id] = filteredTasks.filter((t) => t.status === status.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ListTodo className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No tasks found</p>
        <p className="text-sm">
          {groupFilter !== "all" ? "Try changing the group filter" : "Create a task to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {TASK_STATUSES.map((status) => {
        const statusTasks = tasksByStatus[status.id];
        if (statusTasks.length === 0) return null;

        return (
          <div key={status.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2 w-2 rounded-full ${status.color}`} />
              <h4 className="font-medium text-sm">{status.name}</h4>
              <Badge variant="secondary" className="text-xs">
                {statusTasks.length}
              </Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {statusTasks.map((task) => {
                const group = findTaskGroup(task, taskGroups);
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    group={group}
                    onClick={() => onTaskClick(task)}
                    onStatusChange={onStatusChange}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ServiceCallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [taskViewMode, setTaskViewMode] = useState<"cards" | "table">("table");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [serviceCallStatus, setServiceCallStatus] = useState<ServiceCallStatus | null>(null);

  // Get service call data
  const serviceCall = getServiceCallById(resolvedParams.id);

  // Initialize status from service call
  if (serviceCall && serviceCallStatus === null) {
    setServiceCallStatus(serviceCall.status);
  }

  if (!serviceCall) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Service Call Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The service call you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push("/service-call")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Service Calls
          </Button>
        </div>
      </div>
    );
  }

  // Task state
  const [taskData, setTaskData] = useState<Task[]>(serviceCall.tasks);

  // Task groups state
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>(
    serviceCall.taskGroups || []
  );

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskSheetOpen(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTaskData(taskData.map(t =>
      t.id === updatedTask.id ? updatedTask : t
    ));
    setSelectedTask(updatedTask);
  };

  const handleTaskStatusChange = (task: Task, newStatus: TaskStatus) => {
    setTaskData(taskData.map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    ));
    // Also update selected task if it's the same one
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...task, status: newStatus });
    }
  };

  const handleServiceCallStatusChange = (newStatus: ServiceCallStatus) => {
    setServiceCallStatus(newStatus);
  };

  const handleCreateGroup = (newGroup: TaskGroup) => {
    setTaskGroups([...taskGroups, newGroup]);
  };

  const handleCreateTask = (newTask: Partial<Task>, groupId?: string) => {
    setTaskData([...taskData, newTask as Task]);

    // If a group is specified, add task to that group
    if (groupId) {
      setTaskGroups(taskGroups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            tasks: [...g.tasks, newTask as Task],
          };
        }
        return g;
      }));
    }
  };

  const handleGroupChange = (task: Task, newGroupId: string | null) => {
    // Remove task from all groups first
    const updatedGroups = taskGroups.map(g => ({
      ...g,
      tasks: g.tasks.filter(t => t.id !== task.id),
    }));

    // Add to new group if specified
    if (newGroupId) {
      setTaskGroups(updatedGroups.map(g => {
        if (g.id === newGroupId) {
          return {
            ...g,
            tasks: [...g.tasks, task],
          };
        }
        return g;
      }));
    } else {
      setTaskGroups(updatedGroups);
    }
  };

  const currentStatus = serviceCallStatus || serviceCall.status;
  const totalTasks = taskData.length;
  const completedTasks = taskData.filter((t) => t.status === "done").length;
  const totalHours = taskData.reduce(
    (sum, t) => sum + t.timeEntries.reduce((s, te) => s + te.hours, 0),
    0
  );
  const totalMaterialCost = taskData.reduce(
    (sum, t) => sum + t.materials.reduce((s, m) => s + m.totalCost, 0),
    0
  );

  // Count ungrouped tasks
  const ungroupedTaskCount = taskData.filter(
    t => !findTaskGroup(t, taskGroups)
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/service-call")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-2xl font-bold">{serviceCall.title}</h1>
            </div>
            <div className="flex items-center gap-3 ml-10">
              {/* Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="cursor-pointer">
                    {getStatusBadge(currentStatus)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {SERVICE_CALL_STATUSES.map((status) => (
                    <DropdownMenuItem
                      key={status.id}
                      onClick={() => handleServiceCallStatusChange(status.id)}
                      className={currentStatus === status.id ? "bg-muted" : ""}
                    >
                      <span className={`h-2 w-2 rounded-full mr-2 ${status.color}`} />
                      {status.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {getPriorityBadge(serviceCall.priority)}
              {serviceCall.clientPO && (
                <Badge variant="outline">PO: {serviceCall.clientPO}</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Assign Team</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Generate Invoice</DropdownMenuItem>
                <DropdownMenuItem>Export PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Info */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {serviceCall.description}
              </p>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <User className="h-4 w-4" />
                    {serviceCall.customer?.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Site</p>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <MapPin className="h-4 w-4" />
                    {serviceCall.site?.name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Issue Type</p>
                  <p className="font-medium mt-1">{serviceCall.issueType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Equipment</p>
                  <p className="font-medium mt-1">{serviceCall.equipmentType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Start Date</p>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(serviceCall.startDate), "MMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">End Date</p>
                  <p className="font-medium flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {serviceCall.endDate
                      ? format(new Date(serviceCall.endDate), "MMM d, yyyy")
                      : "In Progress"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Tasks</span>
                    <span className="font-medium">
                      {completedTasks}/{totalTasks}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: totalTasks
                          ? `${(completedTasks / totalTasks) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Groups</span>
                    <span className="font-medium">{taskGroups.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hours Logged</span>
                    <span className="font-medium">{totalHours}h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Material Cost</span>
                    <span className="font-medium">${totalMaterialCost.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <FinancialSummary serviceCall={serviceCall} />
          </div>
        </div>

        {/* Tasks Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Tasks
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Group Filter */}
                {taskGroups.length > 0 && (
                  <Select value={groupFilter} onValueChange={setGroupFilter}>
                    <SelectTrigger className="w-[180px] h-8">
                      <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Filter by group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-400" />
                          All Groups ({totalTasks})
                        </div>
                      </SelectItem>
                      {taskGroups.map((group) => {
                        const groupTaskCount = taskData.filter(
                          t => findTaskGroup(t, taskGroups)?.id === group.id
                        ).length;
                        return (
                          <SelectItem key={group.id} value={group.id}>
                            <div className="flex items-center gap-2">
                              <span className={`h-2 w-2 rounded-full ${getGroupColor(group.id)}`} />
                              {group.name} ({groupTaskCount})
                            </div>
                          </SelectItem>
                        );
                      })}
                      {ungroupedTaskCount > 0 && (
                        <SelectItem value="ungrouped">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-slate-300" />
                            Ungrouped ({ungroupedTaskCount})
                          </div>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}

                {/* View Toggle */}
                <Tabs
                  value={taskViewMode}
                  onValueChange={(v) => setTaskViewMode(v as "cards" | "table")}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="cards" className="h-7 px-2">
                      <LayoutGrid className="h-4 w-4 mr-1" />
                      Cards
                    </TabsTrigger>
                    <TabsTrigger value="table" className="h-7 px-2">
                      <List className="h-4 w-4 mr-1" />
                      Table
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Actions */}
                <TaskGroupDialog
                  serviceCallId={serviceCall.id}
                  onGroupCreate={handleCreateGroup}
                />
                <TaskDialog
                  serviceCallId={serviceCall.id}
                  sites={mockSites.filter(s => s.customerId === serviceCall.customerId)}
                  employees={mockEmployees}
                  taskGroups={taskGroups}
                  onTaskCreate={(newTask, groupId) => handleCreateTask(newTask, groupId)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {taskData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ListTodo className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">No tasks yet</p>
                <p className="text-sm">Create a task group or add a task to get started</p>
                <div className="mt-4 flex gap-2">
                  <TaskGroupDialog
                    serviceCallId={serviceCall.id}
                    onGroupCreate={handleCreateGroup}
                    trigger={
                      <Button variant="outline">
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Create Group
                      </Button>
                    }
                  />
                  <TaskDialog
                    serviceCallId={serviceCall.id}
                    sites={mockSites.filter(s => s.customerId === serviceCall.customerId)}
                    employees={mockEmployees}
                    taskGroups={taskGroups}
                    onTaskCreate={(newTask, groupId) => handleCreateTask(newTask, groupId)}
                    trigger={
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Task
                      </Button>
                    }
                  />
                </div>
              </div>
            ) : taskViewMode === "cards" ? (
              <TaskCardView
                tasks={taskData}
                taskGroups={taskGroups}
                groupFilter={groupFilter}
                onTaskClick={handleTaskClick}
                onStatusChange={handleTaskStatusChange}
              />
            ) : (
              <TaskTableView
                tasks={taskData}
                taskGroups={taskGroups}
                groupFilter={groupFilter}
                onTaskClick={handleTaskClick}
                onStatusChange={handleTaskStatusChange}
              />
            )}
          </CardContent>
        </Card>

        {/* Communication Threads */}
        <div className="grid gap-6 md:grid-cols-2">
          <CommunicationThread type="internal" serviceCallId={serviceCall.id} />
          <CommunicationThread type="external" serviceCallId={serviceCall.id} />
        </div>
      </div>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={selectedTask}
        open={taskSheetOpen}
        onOpenChange={setTaskSheetOpen}
        onTaskUpdate={handleTaskUpdate}
        onGroupChange={handleGroupChange}
        employees={mockEmployees}
        taskGroups={taskGroups}
      />
    </div>
  );
}
