// Status Enums
export type ServiceCallStatus = 'open' | 'in_progress' | 'resolved' | 'invoiced' | 'closed'
export type ServiceCallPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type RateType = 'regular' | 'overtime' | 'weekend' | 'holiday'
export type MaterialSource = 'stock' | 'purchased' | 'customer_provided'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type InvoiceLineType = 'labor' | 'material' | 'travel' | 'other'
export type IssueType = 'network' | 'hardware' | 'software' | 'installation' | 'maintenance' | 'other'

// Reference Entities
export interface Site {
  id: string
  name: string
  address: string
  customerId: string
}

export interface Employee {
  id: string
  name: string
  email: string
  role: string
  hourlyRate: number
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
}

// Core Entities
export interface ServiceCall {
  id: string
  title: string
  description: string
  priority: ServiceCallPriority
  status: ServiceCallStatus
  siteId: string
  requesterName: string
  requesterContact?: string
  issueType: IssueType
  equipmentType?: string
  attachments: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface Task {
  id: string
  serviceCallId: string
  title: string
  description?: string
  status: TaskStatus
  assignedEmployees: string[]
  estimatedHours?: number
  createdAt: string
  completedAt?: string
}

export interface TimeEntry {
  id: string
  taskId: string
  employeeId: string
  date: string
  hours: number
  rateType: RateType
  notes?: string
  billable: boolean
}

export interface MaterialUsage {
  id: string
  taskId: string
  materialId?: string
  materialName: string
  quantity: number
  unit: string
  unitCost?: number
  source: MaterialSource
}

export interface Invoice {
  id: string
  invoiceNumber: string
  serviceCallId: string
  customerId: string
  status: InvoiceStatus
  subtotal: number
  taxAmount: number
  totalAmount: number
  issuedDate: string
  dueDate: string
}

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  type: InvoiceLineType
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taskId?: string
}

// Form Types
export interface ServiceCallFormData {
  title: string
  description: string
  priority: ServiceCallPriority
  siteId: string
  requesterName: string
  requesterContact?: string
  issueType: IssueType
  equipmentType?: string
}

export interface TaskFormData {
  title: string
  description?: string
  assignedEmployees: string[]
  estimatedHours?: number
}

export interface TimeEntryFormData {
  date: string
  hours: number
  rateType: RateType
  notes?: string
  billable: boolean
  employeeId: string
}

export interface MaterialUsageFormData {
  materialName: string
  quantity: number
  unit: string
  unitCost?: number
  source: MaterialSource
}

export interface InvoiceFormData {
  serviceCallId: string
  customerId: string
  dueDate: string
  lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId'>[]
}
