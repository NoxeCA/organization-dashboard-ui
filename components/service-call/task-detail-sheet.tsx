"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Edit2,
  MapPin,
  Package,
  Plus,
  Save,
  Trash2,
  User,
  X,
  DollarSign,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  type Task,
  type TimeEntry,
  type Material,
  type Employee,
  type TaskStatus,
  TASK_STATUSES,
} from "@/lib/types/service-call";
import { mockEmployees } from "@/lib/mock-service-calls";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate?: (task: Task) => void;
  employees?: Employee[];
}

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
  employees = mockEmployees,
}: TaskDetailSheetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newTimeEntry, setNewTimeEntry] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    hours: "",
    description: "",
    employeeId: "",
  });
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    quantity: "",
    unitCost: "",
    status: "estimated" as "estimated" | "ordered" | "used",
  });

  if (!task) return null;

  const currentTask = editedTask || task;
  const totalHours = currentTask.timeEntries.reduce((sum, te) => sum + te.hours, 0);
  const totalMaterialCost = currentTask.materials.reduce(
    (sum, m) => sum + m.totalCost,
    0
  );

  const handleEdit = () => {
    setEditedTask({ ...task });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editedTask) {
      onTaskUpdate?.(editedTask);
      setIsEditing(false);
      setEditedTask(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTask(null);
  };

  const handleStatusChange = (status: TaskStatus) => {
    if (editedTask) {
      setEditedTask({ ...editedTask, status, column: status });
    }
  };

  const handleAddTimeEntry = () => {
    if (!editedTask || !newTimeEntry.hours || !newTimeEntry.employeeId) return;

    const employee = employees.find((e) => e.id === newTimeEntry.employeeId);
    const entry: TimeEntry = {
      id: `te-${Date.now()}`,
      taskId: editedTask.id,
      employeeId: newTimeEntry.employeeId,
      employee,
      date: newTimeEntry.date,
      hours: parseFloat(newTimeEntry.hours),
      description: newTimeEntry.description,
      billable: true,
    };

    setEditedTask({
      ...editedTask,
      timeEntries: [...editedTask.timeEntries, entry],
    });

    setNewTimeEntry({
      date: format(new Date(), "yyyy-MM-dd"),
      hours: "",
      description: "",
      employeeId: "",
    });
  };

  const handleRemoveTimeEntry = (entryId: string) => {
    if (!editedTask) return;
    setEditedTask({
      ...editedTask,
      timeEntries: editedTask.timeEntries.filter((te) => te.id !== entryId),
    });
  };

  const handleAddMaterial = () => {
    if (!editedTask || !newMaterial.name || !newMaterial.quantity) return;

    const quantity = parseInt(newMaterial.quantity);
    const unitCost = parseFloat(newMaterial.unitCost) || 0;
    const material: Material = {
      id: `mat-${Date.now()}`,
      taskId: editedTask.id,
      name: newMaterial.name,
      quantity,
      unitCost,
      totalCost: quantity * unitCost,
      status: newMaterial.status,
    };

    setEditedTask({
      ...editedTask,
      materials: [...editedTask.materials, material],
    });

    setNewMaterial({
      name: "",
      quantity: "",
      unitCost: "",
      status: "estimated",
    });
  };

  const handleRemoveMaterial = (materialId: string) => {
    if (!editedTask) return;
    setEditedTask({
      ...editedTask,
      materials: editedTask.materials.filter((m) => m.id !== materialId),
    });
  };

  const getStatusColor = (status: TaskStatus) => {
    const config = TASK_STATUSES.find((s) => s.id === status);
    return config?.color || "bg-gray-500";
  };

  const getMaterialStatusColor = (status: Material["status"]) => {
    switch (status) {
      case "estimated":
        return "bg-gray-500";
      case "ordered":
        return "bg-yellow-500";
      case "used":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[600px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <SheetTitle className="text-xl">{currentTask.name}</SheetTitle>
              <SheetDescription className="mt-1">
                {currentTask.site?.name}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={handleEdit}>
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="time">
                Time ({totalHours}h)
              </TabsTrigger>
              <TabsTrigger value="materials">
                Materials ({currentTask.materials.length})
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                {isEditing ? (
                  <Select
                    value={editedTask?.status}
                    onValueChange={(v) => handleStatusChange(v as TaskStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_STATUSES.map((status) => (
                        <SelectItem key={status.id} value={status.id}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${status.color}`}
                            />
                            {status.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-2 w-fit"
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${getStatusColor(
                        currentTask.status
                      )}`}
                    />
                    {TASK_STATUSES.find((s) => s.id === currentTask.status)?.name}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                {isEditing ? (
                  <Textarea
                    value={editedTask?.description || ""}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask!,
                        description: e.target.value,
                      })
                    }
                    className="resize-none"
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {currentTask.description || "No description"}
                  </p>
                )}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Planned Time
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.5"
                      value={editedTask?.plannedTime || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask!,
                          plannedTime: parseFloat(e.target.value) || undefined,
                        })
                      }
                      placeholder="Hours"
                    />
                  ) : (
                    <p className="text-sm">
                      {currentTask.plannedTime
                        ? `${currentTask.plannedTime}h`
                        : "Not set"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={editedTask?.dueDate || ""}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask!,
                          dueDate: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm">
                      {currentTask.dueDate
                        ? format(new Date(currentTask.dueDate), "MMM d, yyyy")
                        : "Not set"}
                    </p>
                  )}
                </div>
              </div>

              {/* Assigned Employees */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Assigned Employees
                </label>
                <div className="flex flex-wrap gap-2">
                  {currentTask.assignedEmployees.length > 0 ? (
                    currentTask.assignedEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center gap-2 bg-muted rounded-full px-3 py-1"
                      >
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={emp.avatar} alt={emp.name} />
                          <AvatarFallback className="text-[8px]">
                            {emp.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{emp.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No employees assigned
                    </p>
                  )}
                </div>
              </div>

              {/* Summary Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Task Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Hours Logged</p>
                    <p className="font-medium">{totalHours}h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Material Cost</p>
                    <p className="font-medium">${totalMaterialCost.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Time Entries Tab */}
            <TabsContent value="time" className="space-y-4 mt-4">
              {isEditing && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Time Entry
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Employee
                        </label>
                        <Select
                          value={newTimeEntry.employeeId}
                          onValueChange={(v) =>
                            setNewTimeEntry({ ...newTimeEntry, employeeId: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Hours
                        </label>
                        <Input
                          type="number"
                          step="0.25"
                          min="0"
                          placeholder="Hours"
                          value={newTimeEntry.hours}
                          onChange={(e) =>
                            setNewTimeEntry({
                              ...newTimeEntry,
                              hours: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Date</label>
                      <Input
                        type="date"
                        value={newTimeEntry.date}
                        onChange={(e) =>
                          setNewTimeEntry({
                            ...newTimeEntry,
                            date: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">
                        Description
                      </label>
                      <Input
                        placeholder="What was done?"
                        value={newTimeEntry.description}
                        onChange={(e) =>
                          setNewTimeEntry({
                            ...newTimeEntry,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddTimeEntry}
                      disabled={!newTimeEntry.hours || !newTimeEntry.employeeId}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Entry
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Time Entries List */}
              <div className="space-y-2">
                {currentTask.timeEntries.length > 0 ? (
                  currentTask.timeEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={entry.employee?.avatar}
                                alt={entry.employee?.name}
                              />
                              <AvatarFallback className="text-xs">
                                {entry.employee?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {entry.employee?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(entry.date), "MMM d, yyyy")} -{" "}
                                {entry.hours}h
                              </p>
                              {entry.description && (
                                <p className="text-sm mt-1">{entry.description}</p>
                              )}
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveTimeEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No time entries yet</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Materials Tab */}
            <TabsContent value="materials" className="space-y-4 mt-4">
              {isEditing && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Material
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Name</label>
                      <Input
                        placeholder="e.g., Cisco Catalyst 9200"
                        value={newMaterial.name}
                        onChange={(e) =>
                          setNewMaterial({ ...newMaterial, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground">Qty</label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          value={newMaterial.quantity}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              quantity: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Unit Cost ($)
                        </label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={newMaterial.unitCost}
                          onChange={(e) =>
                            setNewMaterial({
                              ...newMaterial,
                              unitCost: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">
                          Status
                        </label>
                        <Select
                          value={newMaterial.status}
                          onValueChange={(v) =>
                            setNewMaterial({
                              ...newMaterial,
                              status: v as Material["status"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="estimated">Estimated</SelectItem>
                            <SelectItem value="ordered">Ordered</SelectItem>
                            <SelectItem value="used">Used</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddMaterial}
                      disabled={!newMaterial.name || !newMaterial.quantity}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Material
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Materials List */}
              <div className="space-y-2">
                {currentTask.materials.length > 0 ? (
                  currentTask.materials.map((material) => (
                    <Card key={material.id}>
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{material.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {material.quantity} x ${material.unitCost.toLocaleString()} ={" "}
                                <span className="font-medium">
                                  ${material.totalCost.toLocaleString()}
                                </span>
                              </p>
                              <Badge
                                variant="secondary"
                                className="mt-1 text-xs capitalize"
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full mr-1 ${getMaterialStatusColor(
                                    material.status
                                  )}`}
                                />
                                {material.status}
                              </Badge>
                            </div>
                          </div>
                          {isEditing && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveMaterial(material.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No materials added</p>
                  </div>
                )}
              </div>

              {/* Total */}
              {currentTask.materials.length > 0 && (
                <Card>
                  <CardContent className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Total Material Cost</span>
                    </div>
                    <span className="text-lg font-bold">
                      ${totalMaterialCost.toLocaleString()}
                    </span>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
