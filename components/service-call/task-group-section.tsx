"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  FolderOpen,
  MoreHorizontal,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  type Task,
  type TaskGroup,
  type TaskStatus,
  TASK_STATUSES,
} from "@/lib/types/service-call";

interface TaskCardContentProps {
  task: Task;
}

function TaskCardContent({ task }: TaskCardContentProps) {
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

interface TaskGroupSectionProps {
  group: TaskGroup | null; // null = ungrouped tasks
  tasks: (Task & { column: TaskStatus })[];
  onTaskClick: (task: Task) => void;
  onTasksChange: (tasks: (Task & { column: TaskStatus })[]) => void;
  onEditGroup?: (group: TaskGroup) => void;
  onDeleteGroup?: (group: TaskGroup) => void;
  defaultOpen?: boolean;
}

export function TaskGroupSection({
  group,
  tasks,
  onTaskClick,
  onTasksChange,
  onEditGroup,
  onDeleteGroup,
  defaultOpen = true,
}: TaskGroupSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const isUngrouped = group === null;
  const groupName = isUngrouped ? "Ungrouped Tasks" : group.name;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const kanbanColumns = TASK_STATUSES.map((status) => ({
    id: status.id,
    name: status.name,
    color: status.color,
  }));

  if (totalTasks === 0 && isUngrouped) {
    return null; // Don't show ungrouped section if empty
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-2 hover:text-primary transition-colors">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{groupName}</span>
            <Badge variant="secondary" className="text-xs">
              {completedTasks}/{totalTasks}
            </Badge>
          </button>
        </CollapsibleTrigger>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          {totalTasks > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round(progressPercent)}%
              </span>
            </div>
          )}

          {/* Group actions */}
          {!isUngrouped && group && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditGroup?.(group)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Rename Group
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDeleteGroup?.(group)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <CollapsibleContent>
        {totalTasks === 0 ? (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks in this group</p>
            <p className="text-xs">Drag tasks here or create a new task</p>
          </div>
        ) : (
          <div className="pl-2">
            <KanbanProvider
              columns={kanbanColumns}
              data={tasks}
              onDataChange={(newData) => {
                // Update task status when moved between columns
                const updatedTasks = newData.map((item) => ({
                  ...item,
                  status: item.column as TaskStatus,
                }));
                onTasksChange(updatedTasks as (Task & { column: TaskStatus })[]);
              }}
            >
              {(column) => (
                <KanbanBoard key={column.id} id={column.id}>
                  <KanbanHeader className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${column.color}`} />
                    {column.name}
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {tasks.filter((t) => t.column === column.id).length}
                    </Badge>
                  </KanbanHeader>
                  <KanbanCards id={column.id}>
                    {(item) => {
                      const task = tasks.find((t) => t.id === item.id)!;
                      return (
                        <KanbanCard
                          key={item.id}
                          id={item.id}
                          name={item.name}
                          column={item.column}
                          onClick={() => onTaskClick(task)}
                        >
                          <TaskCardContent task={task} />
                        </KanbanCard>
                      );
                    }}
                  </KanbanCards>
                </KanbanBoard>
              )}
            </KanbanProvider>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
