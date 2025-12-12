// Status Enums
export type ServiceCallStatus = 'open' | 'in_progress' | 'resolved' | 'invoiced' | 'closed'
export type ServiceCallPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type RateType = 'regular' | 'overtime' | 'weekend' | 'holiday'
export type MaterialSource = 'stock' | 'purchased' | 'customer_provided'
export type TimeEntryMode = 'manual' | 'duration' | 'start_end' | 'timer'
export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
export type InvoiceLineType = 'labor' | 'material' | 'travel' | 'other'
export type IssueType = 'network' | 'hardware' | 'software' | 'installation' | 'maintenance' | 'other'
export type POStatus = 'draft' | 'sent' | 'approved' | 'received' | 'cancelled'
export type PaymentMethod = 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other'

// Currency & Tax Configuration
export interface Currency {
  code: string               // ISO 4217 (USD, EUR, GBP, etc.)
  symbol: string             // $, €, £
  name: string               // US Dollar, Euro, etc.
  decimalPlaces: number      // Usually 2
  symbolPosition: 'before' | 'after'
}

export interface TaxCode {
  id: string
  code: string               // e.g., "VAT-STD", "GST", "EXEMPT"
  name: string               // e.g., "Standard VAT", "GST", "Tax Exempt"
  rate: number               // 0.09 for 9%, 0 for exempt
  description?: string
  isDefault: boolean
}

// Address for billing
export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Service Call Site Association
export interface ServiceCallSite {
  siteId: string
  isMainBillingSite: boolean
}

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
  // Billing fields
  billingAddress?: Address
  shippingAddress?: Address
  taxId?: string              // VAT/Tax ID number
  defaultTaxCodeId: string    // Customer's default tax code
  defaultCurrency: string     // ISO currency code
  paymentTermsDays: number    // Default: 30
  creditLimit?: number
  notes?: string
}

// Core Entities
export interface ServiceCall {
  id: string
  title: string
  description: string
  priority: ServiceCallPriority
  status: ServiceCallStatus
  customerId: string              // Direct customer reference
  siteId: string                  // Main billing site (for backwards compatibility)
  sites?: ServiceCallSite[]       // All selected sites with main billing flag
  ownerId?: string                // Service Call owner (single employee)
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
  groupId?: string           // Reference to TaskGroup
  title: string
  description?: string
  status: TaskStatus
  ownerId?: string           // Task owner (single employee)
  assignedEmployees: string[]
  estimatedHours?: number
  sortOrder?: number         // Order within group
  dueDate?: string           // Optional due date ISO string
  createdAt: string
  completedAt?: string
}

export interface TaskGroup {
  id: string
  serviceCallId: string
  name: string
  color: string              // Hex color, e.g., "#3B82F6"
  sortOrder: number
  isDefault: boolean         // True for "General" - can't be deleted
  isCollapsed: boolean       // Collapse state
  dueDate?: string           // Optional ISO date
  createdAt: string
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
  // Time entry mode fields
  startTime?: string           // "HH:mm" format
  endTime?: string             // "HH:mm" format
  entryMode?: TimeEntryMode    // How the entry was created
  // Invoice tracking
  invoiced: boolean            // Has this been invoiced?
  invoiceId?: string           // Which invoice includes this?
  invoicedAt?: string          // When was it invoiced?
}

export interface ActiveTimer {
  id: string
  taskId: string
  employeeId: string
  startedAt: string            // ISO datetime when timer started
  rateType: RateType
  billable: boolean
  notes?: string
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
  // Invoice tracking
  invoiced: boolean            // Has this been invoiced?
  invoiceId?: string           // Which invoice includes this?
  invoicedAt?: string          // When was it invoiced?
}

export interface Invoice {
  id: string
  invoiceNumber: string
  serviceCallId: string
  customerId: string
  status: InvoiceStatus

  // Currency
  currency: string            // ISO currency code (USD, EUR, etc.)
  exchangeRate?: number       // Rate to base currency at invoice time

  // Tax
  taxCodeId: string           // Reference to TaxCode
  taxRate: number             // Snapshot of tax rate at invoice time

  // Amounts (all in invoice currency)
  subtotal: number
  discountAmount: number
  discountPercent?: number
  taxableAmount: number
  taxAmount: number
  totalAmount: number
  amountPaid: number
  amountDue: number

  // Dates
  issuedDate: string
  dueDate: string
  paidDate?: string

  // Payment info
  paymentTerms: string        // e.g., "Net 30"
  paymentMethod?: PaymentMethod
  paymentReference?: string

  // Additional info
  notes?: string              // Shown on invoice
  internalNotes?: string      // Not shown on invoice
  purchaseOrderNumber?: string

  // Addresses (snapshot at invoice time)
  billingAddress?: Address

  // Cancellation
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string

  // Audit
  createdAt: string
  updatedAt: string
  createdBy: string
  sentAt?: string
  sentBy?: string
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

  // Per-line tax support (optional override)
  taxCodeId?: string          // Can override invoice-level tax
  taxRate?: number
  taxAmount?: number

  // Track source for unlinking on cancel
  sourceType?: 'time_entry' | 'material'
  sourceId?: string           // ID of the time entry or material
}

// Payment for tracking partial payments
export interface Payment {
  id: string
  invoiceId: string
  amount: number
  currency: string
  paymentDate: string
  paymentMethod: PaymentMethod
  reference?: string          // Check #, transaction ID
  notes?: string
  createdAt: string
  createdBy: string
}

export interface PurchaseOrder {
  id: string
  poNumber: string
  supplierId: string
  serviceCallId: string
  expectedDelivery: string
  status: POStatus
  totalAmount: number
  createdAt: string
  receivedAt?: string
}

export interface POLineItem {
  id: string
  purchaseOrderId: string
  materialName: string
  quantity: number
  unit: string
  unitPrice: number
  totalPrice: number
}

// Form Types
export interface ServiceCallFormData {
  title: string
  description: string
  priority: ServiceCallPriority
  customerId: string              // Selected customer
  sites: ServiceCallSite[]        // Selected sites with main billing flag
  requesterName: string
  requesterContact?: string
  issueType: IssueType
  equipmentType?: string
}

export interface TaskFormData {
  title: string
  description?: string
  ownerId?: string           // Task owner
  assignedEmployees: string[]
  estimatedHours?: number
  groupId?: string           // Optional group assignment
}

export interface TaskGroupFormData {
  name: string
  color: string
  dueDate?: string
}

export interface POFormData {
  supplierId: string
  serviceCallId: string
  expectedDelivery: string
  lineItems: {
    materialName: string
    quantity: number
    unit: string
    unitPrice: number
  }[]
}

export interface TimeEntryFormData {
  date: string
  hours: number
  rateType: RateType
  notes?: string
  billable: boolean
  employeeId: string
  // Time entry mode fields
  startTime?: string
  endTime?: string
  entryMode?: TimeEntryMode
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
  currency: string
  taxCodeId: string
  dueDate: string
  paymentTerms: string
  discountPercent?: number
  notes?: string
  purchaseOrderNumber?: string
  lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId'>[]
}

// Payment form data
export interface PaymentFormData {
  invoiceId: string
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
  reference?: string
  notes?: string
}
