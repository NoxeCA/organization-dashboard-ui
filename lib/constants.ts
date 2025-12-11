import type {
  ServiceCallStatus,
  ServiceCallPriority,
  TaskStatus,
  RateType,
  MaterialSource,
  POStatus,
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
  open: 'bg-blue-500 text-white',
  in_progress: 'bg-yellow-500 text-white',
  resolved: 'bg-green-500 text-white',
  invoiced: 'bg-purple-500 text-white',
  closed: 'bg-gray-500 text-white',
}

// Priority
export const PRIORITY_OPTIONS: { value: ServiceCallPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export const PRIORITY_COLORS: Record<ServiceCallPriority, string> = {
  low: 'bg-gray-400 text-white',
  medium: 'bg-blue-500 text-white',
  high: 'bg-orange-500 text-white',
  critical: 'bg-red-500 text-white',
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
  todo: 'bg-gray-400 text-white',
  in_progress: 'bg-blue-500 text-white',
  completed: 'bg-green-500 text-white',
  cancelled: 'bg-red-500 text-white',
}

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

// Purchase Order Status
export const PO_STATUS_OPTIONS: { value: POStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved', label: 'Approved' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const PO_STATUS_COLORS: Record<POStatus, string> = {
  draft: 'bg-gray-400 text-white',
  submitted: 'bg-blue-500 text-white',
  approved: 'bg-green-500 text-white',
  received: 'bg-purple-500 text-white',
  cancelled: 'bg-red-500 text-white',
}

// Invoice Status
export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-400 text-white',
  sent: 'bg-blue-500 text-white',
  paid: 'bg-green-500 text-white',
  overdue: 'bg-orange-500 text-white',
  cancelled: 'bg-red-500 text-white',
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
