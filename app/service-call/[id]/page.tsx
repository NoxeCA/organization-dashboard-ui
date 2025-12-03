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
  FolderOpen,
  ListTodo,
  MapPin,
  MoreHorizontal,
  Package,
  Plus,
  User,
  Kanban,
  List,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  mockServiceCalls,
  getServiceCallById,
  mockEmployees,
  mockSites,
} from "@/lib/mock-service-calls";
import { TaskDialog } from "@/components/service-call/task-dialog";
import { TaskDetailSheet } from "@/components/service-call/task-detail-sheet";
import { CommunicationThread } from "@/components/service-call/communication-thread";
import { TaskGroupDialog } from "@/components/service-call/task-group-dialog";
import { TaskGroupSection } from "@/components/service-call/task-group-section";
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

// Task list view (updated to support groups)
function TaskListView({
  tasks,
  taskGroups,
  onTaskClick,
}: {
  tasks: Task[];
  taskGroups: TaskGroup[];
  onTaskClick: (task: Task) => void;
}) {
  // Group tasks by task group
  const groupedByTaskGroup = taskGroups.map(group => ({
    group,
    tasks: tasks.filter(t => group.tasks.some(gt => gt.id === t.id)),
  }));

  // Ungrouped tasks
  const groupedTaskIds = taskGroups.flatMap(g => g.tasks.map(t => t.id));
  const ungroupedTasks = tasks.filter(t => !groupedTaskIds.includes(t.id));

  const renderTasksByStatus = (tasksToRender: Task[]) => {
    const groupedTasks = TASK_STATUSES.reduce((acc, status) => {
      acc[status.id] = tasksToRender.filter((t) => t.status === status.id);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);

    return (
      <div className="space-y-4">
        {TASK_STATUSES.map((status) => {
          const statusTasks = groupedTasks[status.id];
          if (statusTasks.length === 0) return null;

          return (
            <div key={status.id}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`h-2 w-2 rounded-full ${status.color}`} />
                <h4 className="font-medium text-sm">{status.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {statusTasks.length}
                </Badge>
              </div>
              <div className="space-y-2 pl-4">
                {statusTasks.map((task) => (
                  <Card
                    key={task.id}
                    className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{task.name}</h5>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {task.site && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {task.site.name}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.dueDate), "MMM d")}
                            </span>
                          )}
                        </div>
                      </div>
                      {task.assignedEmployees.length > 0 && (
                        <div className="flex -space-x-1">
                          {task.assignedEmployees.slice(0, 2).map((emp) => (
                            <Avatar key={emp.id} className="h-5 w-5 border-2 border-background">
                              <AvatarImage src={emp.avatar} alt={emp.name} />
                              <AvatarFallback className="text-[8px]">
                                {emp.name.split(" ").map((n) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Render grouped tasks */}
      {groupedByTaskGroup.map(({ group, tasks: groupTasks }) => (
        groupTasks.length > 0 && (
          <div key={group.id} className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium">{group.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {groupTasks.length} tasks
              </Badge>
            </div>
            {renderTasksByStatus(groupTasks)}
          </div>
        )
      ))}

      {/* Render ungrouped tasks */}
      {ungroupedTasks.length > 0 && (
        <div className="border rounded-lg p-4 border-dashed">
          <div className="flex items-center gap-2 mb-4">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-muted-foreground">Ungrouped Tasks</h3>
            <Badge variant="secondary" className="text-xs">
              {ungroupedTasks.length} tasks
            </Badge>
          </div>
          {renderTasksByStatus(ungroupedTasks)}
        </div>
      )}
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
  const [editingGroup, setEditingGroup] = useState<TaskGroup | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

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

  // Task state with column for Kanban
  const [taskData, setTaskData] = useState(
    serviceCall.tasks.map((t) => ({ ...t, column: t.status }))
  );

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
      t.id === updatedTask.id ? { ...updatedTask, column: updatedTask.status } : t
    ));
    setSelectedTask(updatedTask);
  };

  const handleStatusChange = (newStatus: ServiceCallStatus) => {
    setServiceCallStatus(newStatus);
  };

  const handleCreateGroup = (newGroup: TaskGroup) => {
    setTaskGroups([...taskGroups, newGroup]);
  };

  const handleUpdateGroup = (updatedGroup: TaskGroup) => {
    setTaskGroups(taskGroups.map(g =>
      g.id === updatedGroup.id ? updatedGroup : g
    ));
    setEditingGroup(null);
    setGroupDialogOpen(false);
  };

  const handleDeleteGroup = (group: TaskGroup) => {
    // Move tasks from deleted group to ungrouped
    const groupTaskIds = group.tasks.map(t => t.id);
    setTaskGroups(taskGroups.filter(g => g.id !== group.id));
  };

  const handleEditGroup = (group: TaskGroup) => {
    setEditingGroup(group);
    setGroupDialogOpen(true);
  };

  // Get tasks for a specific group
  const getTasksForGroup = (group: TaskGroup | null) => {
    if (group === null) {
      // Ungrouped tasks
      const groupedTaskIds = taskGroups.flatMap(g => g.tasks.map(t => t.id));
      return taskData.filter(t => !groupedTaskIds.includes(t.id));
    }
    return taskData.filter(t => group.tasks.some(gt => gt.id === t.id));
  };

  // Update tasks when they change in a group section
  const handleGroupTasksChange = (
    group: TaskGroup | null,
    updatedTasks: (Task & { column: TaskStatus })[]
  ) => {
    // Update taskData with the new task states
    setTaskData(prevData => {
      const updatedIds = updatedTasks.map(t => t.id);
      const otherTasks = prevData.filter(t => !updatedIds.includes(t.id));
      return [...otherTasks, ...updatedTasks];
    });
  };

  const handleCreateTask = (newTask: Partial<Task>, groupId?: string) => {
    const taskWithColumn = { ...newTask, column: newTask.status } as typeof taskData[0];
    setTaskData([...taskData, taskWithColumn]);

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
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Tasks
                {taskGroups.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {taskGroups.length} group{taskGroups.length !== 1 ? "s" : ""}
                  </Badge>
                )}
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
            {taskViewMode === "kanban" ? (
              <div className="space-y-6 min-h-[400px]">
                {taskData.length > 0 || taskGroups.length > 0 ? (
                  <>
                    {/* Render task groups */}
                    {taskGroups.map((group) => (
                      <TaskGroupSection
                        key={group.id}
                        group={group}
                        tasks={getTasksForGroup(group)}
                        onTaskClick={handleTaskClick}
                        onTasksChange={(tasks) => handleGroupTasksChange(group, tasks)}
                        onEditGroup={handleEditGroup}
                        onDeleteGroup={handleDeleteGroup}
                      />
                    ))}

                    {/* Render ungrouped tasks */}
                    <TaskGroupSection
                      group={null}
                      tasks={getTasksForGroup(null)}
                      onTaskClick={handleTaskClick}
                      onTasksChange={(tasks) => handleGroupTasksChange(null, tasks)}
                      defaultOpen={taskGroups.length === 0}
                    />
                  </>
                ) : (
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
                )}
              </div>
            ) : (
              <TaskListView
                tasks={taskData}
                taskGroups={taskGroups}
                onTaskClick={handleTaskClick}
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
        employees={mockEmployees}
        taskGroups={taskGroups}
      />

      {/* Edit Group Dialog */}
      {editingGroup && (
        <TaskGroupDialog
          serviceCallId={serviceCall.id}
          existingGroup={editingGroup}
          onGroupUpdate={handleUpdateGroup}
          trigger={<span />}
        />
      )}
    </div>
  );
}
