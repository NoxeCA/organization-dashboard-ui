// Service Call Types based on business.context.md

export type ServiceCallStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "invoiced"
  | "closed";

export type TaskStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "done";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface ServiceCallStatus_Config {
  id: ServiceCallStatus;
  name: string;
  color: string;
}

export interface TaskStatus_Config {
  id: TaskStatus;
  name: string;
  color: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  customerId: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  position?: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  employeeId: string;
  employee?: Employee;
  date: string;
  hours: number;
  description?: string;
  billable: boolean;
}

export interface Material {
  id: string;
  taskId: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: "estimated" | "ordered" | "used";
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  serviceCallId?: string;
  projectId?: string;
  groupId?: string; // Reference to TaskGroup.id
  siteId: string;
  site?: Site;
  assignedEmployees: Employee[];
  readOnlyAssignees?: Employee[];
  plannedTime?: number; // in hours
  timeEntries: TimeEntry[];
  materials: Material[];
  startDate?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  // For kanban - column mapping
  column: TaskStatus;
}

export interface ThreadMessage {
  id: string;
  authorId: string;
  author?: Employee | Customer;
  content: string;
  attachments?: string[];
  createdAt: string;
  isInternal: boolean;
}

export interface CommunicationThread {
  id: string;
  serviceCallId: string;
  type: "internal" | "external";
  messages: ThreadMessage[];
}

export interface ServiceCall {
  id: string;
  title: string;
  description: string;
  status: ServiceCallStatus;
  priority: Priority;

  // Customer & Location
  customerId: string;
  customer?: Customer;
  siteId: string;
  site?: Site;
  billToId?: string;

  // Dates
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;

  // Requester info (from noxe app request form)
  requesterId?: string;
  requester?: Employee | Customer;
  issueType?: string;
  equipmentType?: string;

  // Tasks (grouped optionally)
  tasks: Task[];
  taskGroups?: TaskGroup[];

  // Communication
  internalThread?: CommunicationThread;
  externalThread?: CommunicationThread;

  // Financial Summary
  summary?: ServiceCallSummary;

  // PO from client
  clientPO?: string;
}

export interface TaskGroup {
  id: string;
  name: string;
  color?: string; // Optional custom color, otherwise uses getGroupColor
  serviceCallId?: string;
  projectId?: string;
}

export interface ServiceCallSummary {
  predictedMaterial: number;
  estimatedSellPrice: number;
  estimatedCost: number;
  realCost: number; // Aggregated from tasks
  realSellPrice: number;
}

// Status configurations
export const SERVICE_CALL_STATUSES: ServiceCallStatus_Config[] = [
  { id: "open", name: "Open", color: "bg-blue-500" },
  { id: "in_progress", name: "In Progress", color: "bg-yellow-500" },
  { id: "resolved", name: "Resolved", color: "bg-green-500" },
  { id: "invoiced", name: "Invoiced", color: "bg-purple-500" },
  { id: "closed", name: "Closed", color: "bg-gray-500" },
];

export const TASK_STATUSES: TaskStatus_Config[] = [
  { id: "backlog", name: "Backlog", color: "bg-gray-500" },
  { id: "todo", name: "To Do", color: "bg-blue-500" },
  { id: "in_progress", name: "In Progress", color: "bg-yellow-500" },
  { id: "done", name: "Done", color: "bg-green-500" },
];

export const PRIORITIES: { id: Priority; name: string; color: string }[] = [
  { id: "low", name: "Low", color: "bg-gray-400" },
  { id: "medium", name: "Medium", color: "bg-blue-400" },
  { id: "high", name: "High", color: "bg-orange-500" },
  { id: "urgent", name: "Urgent", color: "bg-red-500" },
];

// Predefined group colors palette
export const GROUP_COLOR_PALETTE = [
  "bg-blue-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-amber-500",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-teal-500",
];

// Get a consistent color for a group based on its ID
export function getGroupColor(groupId: string, customColor?: string): string {
  if (customColor) return customColor;

  // Generate a hash from the groupId to get a consistent index
  let hash = 0;
  for (let i = 0; i < groupId.length; i++) {
    const char = groupId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % GROUP_COLOR_PALETTE.length;
  return GROUP_COLOR_PALETTE[index];
}
