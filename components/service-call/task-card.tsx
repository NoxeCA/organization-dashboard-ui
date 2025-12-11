"use client";

import { format } from "date-fns";
import {
  Calendar,
  Clock,
  FolderOpen,
  MapPin,
  Package,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  type Task,
  type TaskGroup,
  type TaskStatus,
  TASK_STATUSES,
  getGroupColor,
} from "@/lib/types/service-call";

interface TaskCardProps {
  task: Task;
  group?: TaskGroup | null;
  onStatusChange?: (task: Task, newStatus: TaskStatus) => void;
  onClick?: () => void;
}

export function TaskCard({
  task,
  group,
  onStatusChange,
  onClick,
}: TaskCardProps) {
  const totalHours = task.timeEntries.reduce((sum, te) => sum + te.hours, 0);
  const plannedHours = task.plannedTime || 0;
  const progressPercent = plannedHours > 0
    ? Math.min((totalHours / plannedHours) * 100, 100)
    : 0;

  const handleStatusChange = (newStatus: TaskStatus) => {
    onStatusChange?.(task, newStatus);
  };

  const cardContent = (
    <div
      className="p-3 space-y-2.5 cursor-pointer"
      onClick={onClick}
    >
      {/* Header: Group badge + Title */}
      <div className="space-y-1.5">
        {group && (
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${getGroupColor(group.id, group.color)}`} />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {group.name}
            </span>
          </div>
        )}
        <h4 className="font-medium text-sm leading-snug line-clamp-2">
          {task.name}
        </h4>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Progress bar (if planned time exists) */}
      {plannedHours > 0 && (
        <div className="space-y-1">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                progressPercent >= 100
                  ? "bg-amber-500"
                  : "bg-primary"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>{totalHours}h / {plannedHours}h</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </div>
      )}

      {/* Metadata row */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        {/* Assignees */}
        {task.assignedEmployees.length > 0 && (
          <div className="flex -space-x-1.5">
            {task.assignedEmployees.slice(0, 3).map((emp) => (
              <Avatar
                key={emp.id}
                className="h-5 w-5 border-2 border-background ring-1 ring-border"
              >
                <AvatarImage src={emp.avatar} alt={emp.name} />
                <AvatarFallback className="text-[8px] font-medium">
                  {emp.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
            ))}
            {task.assignedEmployees.length > 3 && (
              <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-medium border-2 border-background">
                +{task.assignedEmployees.length - 3}
              </div>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Due date */}
        {task.dueDate && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}

        {/* Hours logged (if no planned time shown) */}
        {!plannedHours && totalHours > 0 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalHours}h
          </span>
        )}

        {/* Materials count */}
        {task.materials.length > 0 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />
            {task.materials.length}
          </span>
        )}
      </div>

      {/* Site (if different from service call site) */}
      {task.site && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pt-0.5 border-t border-border/50">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{task.site.name}</span>
        </div>
      )}
    </div>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="rounded-lg border bg-card hover:border-primary/50 hover:shadow-sm transition-all">
          {cardContent}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Clock className="h-4 w-4 mr-2" />
            Change Status
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            {TASK_STATUSES.map((status) => (
              <ContextMenuItem
                key={status.id}
                onClick={() => handleStatusChange(status.id)}
                className={task.status === status.id ? "bg-muted" : ""}
              >
                <span className={`h-2 w-2 rounded-full mr-2 ${status.color}`} />
                {status.name}
                {task.status === status.id && (
                  <span className="ml-auto text-xs text-muted-foreground">Current</span>
                )}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onClick}>
          View Details
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

