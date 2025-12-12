import type {
  ServiceCallStatus,
  ServiceCallPriority,
  TaskStatus,
  RateType,
  MaterialSource,
  InvoiceStatus,
  IssueType,
} from './types'

// Service Call Status
export const SERVICE_CALL_STATUS_OPTIONS: { value: ServiceCallStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'invoiced', label: 'Invoiced' },
  { value: 'closed', label: 'Closed' },
]

// Service Call Status Transitions - defines valid status changes
export const SERVICE_CALL_TRANSITIONS: Record<ServiceCallStatus, ServiceCallStatus[]> = {
  open: ['in_progress'],
  in_progress: ['resolved', 'open'],
  resolved: ['invoiced', 'in_progress'],
  invoiced: ['closed'],
  closed: [],
}

export const SERVICE_CALL_STATUS_COLORS: Record<ServiceCallStatus, string> = {
  open: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  invoiced: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
}

// Priority
export const PRIORITY_OPTIONS: { value: ServiceCallPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const PRIORITY_COLORS: Record<ServiceCallPriority, string> = {
  low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// Task Status
export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

// Task Status Transitions - defines valid status changes
export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'todo', 'cancelled'],
  completed: [],  // Terminal state
  cancelled: [],  // Terminal state
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// Task Group Colors
export const GROUP_COLORS = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Slate', value: '#64748B' },
] as const

export const DEFAULT_GROUP_COLOR = GROUP_COLORS[0].value

// Rate Types
export const RATE_TYPE_OPTIONS: { value: RateType; label: string }[] = [
  { value: 'regular', label: 'Regular' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'holiday', label: 'Holiday' },
]

export const RATE_MULTIPLIERS: Record<RateType, number> = {
  regular: 1.0,
  overtime: 1.5,
  weekend: 1.5,
  holiday: 2.0,
}

// Material Source
export const MATERIAL_SOURCE_OPTIONS: { value: MaterialSource; label: string }[] = [
  { value: 'stock', label: 'Stock' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'customer_provided', label: 'Customer Provided' },
]

// Invoice Status
export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  overdue: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

// Issue Types
export const ISSUE_TYPE_OPTIONS: { value: IssueType; label: string }[] = [
  { value: 'network', label: 'Network/Connectivity' },
  { value: 'hardware', label: 'Hardware' },
  { value: 'software', label: 'Software' },
  { value: 'installation', label: 'Installation' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'other', label: 'Other' },
]

// Units
export const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'm', label: 'Meters' },
  { value: 'ft', label: 'Feet' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'L', label: 'Liters' },
  { value: 'box', label: 'Box' },
  { value: 'roll', label: 'Roll' },
  { value: 'set', label: 'Set' },
]

// Format helpers
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Tax Configuration
export const DEFAULT_TAX_RATE = 0.09

// Invoice warning threshold
export const LOW_INVOICE_THRESHOLD = 100
