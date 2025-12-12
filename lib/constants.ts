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

// Task Status - Monday.com style configuration
export const TASK_STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'Working on it' },
  { value: 'completed', label: 'Done' },
  { value: 'cancelled', label: 'Stuck' },
]

// Task Status Transitions - defines valid status changes
export const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'todo', 'cancelled'],
  completed: ['in_progress'],  // Allow reopening
  cancelled: ['todo', 'in_progress'],  // Allow unstuck
}

// Monday.com style badge colors (Tailwind classes)
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400',
}

// Monday.com style solid colors for status badges
export const TASK_STATUS_SOLID_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  todo: { bg: '#C4C4C4', text: '#FFFFFF' },
  in_progress: { bg: '#FDAB3D', text: '#FFFFFF' },
  completed: { bg: '#00C875', text: '#FFFFFF' },
  cancelled: { bg: '#E2445C', text: '#FFFFFF' },
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

// Rate Type Options with Multiplier Display
export const RATE_TYPE_OPTIONS_WITH_MULTIPLIER: { value: RateType; label: string; multiplier: number }[] = [
  { value: 'regular', label: 'Regular', multiplier: 1.0 },
  { value: 'overtime', label: 'Overtime (1.5x)', multiplier: 1.5 },
  { value: 'weekend', label: 'Weekend (1.5x)', multiplier: 1.5 },
  { value: 'holiday', label: 'Holiday (2x)', multiplier: 2.0 },
]

// Rate Type Colors for Visual Distinction
export const RATE_TYPE_COLORS: Record<RateType, string> = {
  regular: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  overtime: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  weekend: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

// Time Entry Presets (in hours) - for quick entry
export const TIME_PRESETS: { value: number; label: string }[] = [
  { value: 0.25, label: '15m' },
  { value: 0.5, label: '30m' },
  { value: 1, label: '1h' },
  { value: 2, label: '2h' },
  { value: 4, label: '4h' },
  { value: 8, label: '8h' },
]

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

// Time Entry Utilities

/**
 * Format hours as a human-readable duration string
 * e.g., 2.5 -> "2h 30m", 0.25 -> "15m", 8 -> "8h"
 */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Calculate hours between two time strings
 * @param startTime - "HH:mm" format
 * @param endTime - "HH:mm" format
 * @returns number of hours (can be negative if end < start)
 */
export function timeToHours(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  const startMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  return (endMinutes - startMinutes) / 60
}

/**
 * Format elapsed seconds as HH:MM:SS
 */
export function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * Convert elapsed seconds to hours (for time entry)
 */
export function secondsToHours(seconds: number): number {
  return Math.round((seconds / 3600) * 4) / 4 // Round to nearest 0.25
}

/**
 * Get current time as "HH:mm" string
 */
export function getCurrentTime(): string {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}
