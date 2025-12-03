"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  ExternalLink,
  ListTodo,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Package,
  Plus,
  Settings,
  User,
  Users,
  Kanban,
  List,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  KanbanProvider,
  KanbanBoard,
  KanbanHeader,
  KanbanCards,
  KanbanCard,
} from "@/components/kibo-ui/kanban";

import {
  mockServiceCalls,
  getServiceCallById,
  getTasksByServiceCallId,
  mockEmployees,
  mockSites,
} from "@/lib/mock-service-calls";
import { TaskDialog } from "@/components/service-call/task-dialog";
import { TaskDetailSheet } from "@/components/service-call/task-detail-sheet";
import { CommunicationThread } from "@/components/service-call/communication-thread";
import {
  SERVICE_CALL_STATUSES,
  TASK_STATUSES,
  PRIORITIES,
  type ServiceCall,
  type Task,
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

const getTaskStatusColor = (status: TaskStatus) => {
  const config = TASK_STATUSES.find((s) => s.id === status);
  return config?.color || "bg-gray-500";
};

// Task card component for Kanban
function TaskCard({ task }: { task: Task }) {
  const totalHours = task.timeEntries.reduce((sum, te) => sum + te.hours, 0);

  return (
    <div className="space-y-2">
      <div className="font-medium text-sm">{task.name}</div>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        {task.assignedEmployees.length > 0 && (
          <div className="flex -space-x-1">
            {task.assignedEmployees.slice(0, 3).map((emp) => (
              <Avatar key={emp.id} className="h-5 w-5 border-2 border-background">
                <AvatarImage src={emp.avatar} alt={emp.name} />
                <AvatarFallback className="text-[8px]">
                  {emp.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignedEmployees.length > 3 && (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] border-2 border-background">
                +{task.assignedEmployees.length - 3}
              </div>
            )}
          </div>
        )}
        {task.dueDate && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
        {totalHours > 0 && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalHours}h
          </span>
        )}
      </div>
      {task.materials.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          {task.materials.length} material{task.materials.length > 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

// Task list view
function TaskListView({ tasks }: { tasks: Task[] }) {
  const groupedTasks = TASK_STATUSES.reduce((acc, status) => {
    acc[status.id] = tasks.filter((t) => t.status === status.id);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);

  return (
    <div className="space-y-6">
      {TASK_STATUSES.map((status) => {
        const statusTasks = groupedTasks[status.id];
        if (statusTasks.length === 0) return null;

        return (
          <div key={status.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className={`h-2 w-2 rounded-full ${status.color}`} />
              <h3 className="font-medium">{status.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {statusTasks.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {statusTasks.map((task) => (
                <Card key={task.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.name}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {task.site && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {task.site.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(task.dueDate), "MMM d, yyyy")}
                          </span>
                        )}
                        {task.plannedTime && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.plannedTime}h planned
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.assignedEmployees.length > 0 && (
                        <div className="flex -space-x-1">
                          {task.assignedEmployees.slice(0, 2).map((emp) => (
                            <Avatar key={emp.id} className="h-6 w-6 border-2 border-background">
                              <AvatarImage src={emp.avatar} alt={emp.name} />
                              <AvatarFallback className="text-[10px]">
                                {emp.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
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

export default function ServiceCallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [taskViewMode, setTaskViewMode] = useState<"kanban" | "list">("kanban");
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

  const tasks = serviceCall.tasks;
  const [taskData, setTaskData] = useState(
    tasks.map((t) => ({ ...t, column: t.status }))
  );

  // Kanban columns based on task statuses
  const kanbanColumns = TASK_STATUSES.map((status) => ({
    id: status.id,
    name: status.name,
    color: status.color,
  }));

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskSheetOpen(true);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTaskData(taskData.map(t =>
      t.id === updatedTask.id ? { ...updatedTask, column: updatedTask.status } : t
    ));
    setSelectedTask(updatedTask);
  };

  const handleStatusChange = (newStatus: ServiceCallStatus) => {
    setServiceCallStatus(newStatus);
    // In a real app, this would make an API call
  };

  const currentStatus = serviceCallStatus || serviceCall.status;
  const totalTasks = taskData.length;
  const completedTasks = taskData.filter((t) => t.status === "done").length;
  const totalHours = tasks.reduce(
    (sum, t) => sum + t.timeEntries.reduce((s, te) => s + te.hours, 0),
    0
  );
  const totalMaterialCost = tasks.reduce(
    (sum, t) => sum + t.materials.reduce((s, m) => s + m.totalCost, 0),
    0
  );

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
                      onClick={() => handleStatusChange(status.id)}
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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Tasks
              </CardTitle>
              <div className="flex items-center gap-2">
                <Tabs
                  value={taskViewMode}
                  onValueChange={(v) => setTaskViewMode(v as "kanban" | "list")}
                >
                  <TabsList className="h-8">
                    <TabsTrigger value="kanban" className="h-7 px-2">
                      <Kanban className="h-4 w-4 mr-1" />
                      Board
                    </TabsTrigger>
                    <TabsTrigger value="list" className="h-7 px-2">
                      <List className="h-4 w-4 mr-1" />
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <TaskDialog
                  serviceCallId={serviceCall.id}
                  sites={mockSites.filter(s => s.customerId === serviceCall.customerId)}
                  employees={mockEmployees}
                  onTaskCreate={(newTask) => {
                    setTaskData([...taskData, { ...newTask, column: newTask.status } as typeof taskData[0]]);
                  }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {taskViewMode === "kanban" ? (
              <div className="min-h-[400px]">
                {tasks.length > 0 ? (
                  <KanbanProvider
                    columns={kanbanColumns}
                    data={taskData}
                    onDataChange={(newData) => setTaskData(newData as typeof taskData)}
                  >
                    {(column) => (
                      <KanbanBoard key={column.id} id={column.id}>
                        <KanbanHeader className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${column.color}`} />
                          {column.name}
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {taskData.filter((t) => t.column === column.id).length}
                          </Badge>
                        </KanbanHeader>
                        <KanbanCards id={column.id}>
                          {(item) => {
                            const task = taskData.find(t => t.id === item.id)!;
                            return (
                              <KanbanCard
                                key={item.id}
                                id={item.id}
                                name={item.name}
                                column={item.column}
                                onClick={() => handleTaskClick(task)}
                              >
                                <TaskCard task={task} />
                              </KanbanCard>
                            );
                          }}
                        </KanbanCards>
                      </KanbanBoard>
                    )}
                  </KanbanProvider>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <ListTodo className="h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">No tasks yet</p>
                    <p className="text-sm">Create your first task to get started</p>
                    <div className="mt-4">
                      <TaskDialog
                        serviceCallId={serviceCall.id}
                        sites={mockSites.filter(s => s.customerId === serviceCall.customerId)}
                        employees={mockEmployees}
                        onTaskCreate={(newTask) => {
                          setTaskData([...taskData, { ...newTask, column: newTask.status } as typeof taskData[0]]);
                        }}
                        trigger={
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Task
                          </Button>
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <TaskListView tasks={tasks} />
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
        employees={mockEmployees}
      />
    </div>
  );
}
