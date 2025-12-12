import type {
  Site,
  Employee,
  Supplier,
  Customer,
  ServiceCall,
  Task,
  TaskGroup,
  TimeEntry,
  MaterialUsage,
  Invoice,
  InvoiceLineItem,
  PurchaseOrder,
  POLineItem,
} from './types'

// Reference Data
export const sites: Site[] = [
  { id: 'SITE-001', name: 'Acme Corp - Main Office', address: '123 Business Ave, New York, NY 10001', customerId: 'CUST-001' },
  { id: 'SITE-002', name: 'Acme Corp - Warehouse', address: '456 Industrial Blvd, New York, NY 10002', customerId: 'CUST-001' },
  { id: 'SITE-003', name: 'TechStart Inc - HQ', address: '789 Innovation Dr, San Francisco, CA 94102', customerId: 'CUST-002' },
  { id: 'SITE-004', name: 'GlobalTrade - Downtown', address: '321 Commerce St, Chicago, IL 60601', customerId: 'CUST-003' },
]

export const employees: Employee[] = [
  { id: 'EMP-001', name: 'John Smith', email: 'john.smith@company.com', role: 'Senior Technician', hourlyRate: 75 },
  { id: 'EMP-002', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Technician', hourlyRate: 55 },
  { id: 'EMP-003', name: 'Mike Wilson', email: 'mike.wilson@company.com', role: 'Junior Technician', hourlyRate: 45 },
  { id: 'EMP-004', name: 'Emily Davis', email: 'emily.davis@company.com', role: 'Lead Engineer', hourlyRate: 95 },
  { id: 'EMP-005', name: 'David Brown', email: 'david.brown@company.com', role: 'Technician', hourlyRate: 55 },
]

export const suppliers: Supplier[] = [
  { id: 'SUP-001', name: 'TechSupply Co', email: 'orders@techsupply.com', phone: '555-0101' },
  { id: 'SUP-002', name: 'CablePro Industries', email: 'sales@cablepro.com', phone: '555-0102' },
  { id: 'SUP-003', name: 'NetworkGear Plus', email: 'info@networkgear.com', phone: '555-0103' },
]

export const customers: Customer[] = [
  { id: 'CUST-001', name: 'Acme Corporation', email: 'contact@acme.com', phone: '555-1001' },
  { id: 'CUST-002', name: 'TechStart Inc', email: 'hello@techstart.com', phone: '555-1002' },
  { id: 'CUST-003', name: 'GlobalTrade LLC', email: 'info@globaltrade.com', phone: '555-1003' },
]

// Service Calls
export const serviceCalls: ServiceCall[] = [
  {
    id: 'SC-2024-001',
    title: 'Camera System Malfunction - Building A',
    description: 'Multiple cameras in Building A showing offline status. Client reports intermittent connectivity issues since yesterday. Need to diagnose and repair.',
    priority: 'high',
    status: 'in_progress',
    siteId: 'SITE-001',
    requesterName: 'John Smith',
    requesterContact: 'john.smith@acme.com',
    issueType: 'network',
    equipmentType: 'IP Camera System',
    attachments: [],
    createdAt: '2024-12-10T09:00:00Z',
    updatedAt: '2024-12-10T14:30:00Z',
    createdBy: 'EMP-001',
  },
  {
    id: 'SC-2024-002',
    title: 'New Access Control Installation',
    description: 'Install new access control system at main entrance. Includes card readers, door controllers, and integration with existing security system.',
    priority: 'medium',
    status: 'open',
    siteId: 'SITE-003',
    requesterName: 'Alice Chen',
    requesterContact: 'alice.chen@techstart.com',
    issueType: 'installation',
    equipmentType: 'Access Control',
    attachments: [],
    createdAt: '2024-12-09T11:00:00Z',
    updatedAt: '2024-12-09T11:00:00Z',
    createdBy: 'EMP-004',
  },
  {
    id: 'SC-2024-003',
    title: 'Server Room Temperature Alert',
    description: 'Temperature sensors triggered alert. HVAC unit may be failing. Urgent inspection needed to prevent equipment damage.',
    priority: 'critical',
    status: 'resolved',
    siteId: 'SITE-004',
    requesterName: 'Robert Lee',
    requesterContact: 'robert.lee@globaltrade.com',
    issueType: 'maintenance',
    equipmentType: 'HVAC/Environmental',
    attachments: [],
    createdAt: '2024-12-08T16:00:00Z',
    updatedAt: '2024-12-09T10:00:00Z',
    createdBy: 'EMP-002',
  },
  {
    id: 'SC-2024-004',
    title: 'Network Switch Replacement',
    description: 'Replace aging network switches in the warehouse. Current switches are end-of-life and causing intermittent connectivity issues.',
    priority: 'low',
    status: 'open',
    siteId: 'SITE-002',
    requesterName: 'Mark Thompson',
    requesterContact: 'mark.t@acme.com',
    issueType: 'hardware',
    attachments: [],
    createdAt: '2024-12-07T09:00:00Z',
    updatedAt: '2024-12-07T09:00:00Z',
    createdBy: 'EMP-003',
  },
]

// Task Groups
export const taskGroups: TaskGroup[] = [
  {
    id: 'TG-001',
    serviceCallId: 'SC-2024-001',
    name: 'General',
    color: '#64748B',
    sortOrder: 0,
    isDefault: true,
    isCollapsed: false,
    createdAt: '2024-12-10T09:00:00Z',
  },
  {
    id: 'TG-002',
    serviceCallId: 'SC-2024-001',
    name: 'Diagnosis Phase',
    color: '#3B82F6',
    sortOrder: 1,
    isDefault: false,
    isCollapsed: false,
    createdAt: '2024-12-10T09:00:00Z',
  },
  {
    id: 'TG-003',
    serviceCallId: 'SC-2024-001',
    name: 'Repair Phase',
    color: '#22C55E',
    sortOrder: 2,
    isDefault: false,
    isCollapsed: false,
    dueDate: '2024-12-15',
    createdAt: '2024-12-10T09:00:00Z',
  },
  {
    id: 'TG-004',
    serviceCallId: 'SC-2024-002',
    name: 'General',
    color: '#64748B',
    sortOrder: 0,
    isDefault: true,
    isCollapsed: false,
    createdAt: '2024-12-09T11:00:00Z',
  },
  {
    id: 'TG-005',
    serviceCallId: 'SC-2024-003',
    name: 'General',
    color: '#64748B',
    sortOrder: 0,
    isDefault: true,
    isCollapsed: false,
    createdAt: '2024-12-08T16:00:00Z',
  },
]

// Tasks
export const tasks: Task[] = [
  {
    id: 'TK-001',
    serviceCallId: 'SC-2024-001',
    groupId: 'TG-002', // Diagnosis Phase
    title: 'Diagnose network connectivity',
    description: 'Check network cables, switches, and router configurations to identify the source of connectivity issues.',
    status: 'completed',
    assignedEmployees: ['EMP-001'],
    estimatedHours: 2,
    sortOrder: 0,
    createdAt: '2024-12-10T09:30:00Z',
    completedAt: '2024-12-10T12:00:00Z',
  },
  {
    id: 'TK-002',
    serviceCallId: 'SC-2024-001',
    groupId: 'TG-003', // Repair Phase
    title: 'Replace faulty network switch',
    description: 'Replace the faulty 24-port switch identified during diagnosis.',
    status: 'in_progress',
    assignedEmployees: ['EMP-001', 'EMP-002'],
    estimatedHours: 3,
    sortOrder: 0,
    createdAt: '2024-12-10T12:30:00Z',
  },
  {
    id: 'TK-003',
    serviceCallId: 'SC-2024-002',
    groupId: 'TG-004', // General
    title: 'Site survey and planning',
    description: 'Conduct site survey to determine optimal placement of card readers and door controllers.',
    status: 'todo',
    assignedEmployees: ['EMP-004'],
    estimatedHours: 4,
    sortOrder: 0,
    createdAt: '2024-12-09T11:30:00Z',
  },
  {
    id: 'TK-004',
    serviceCallId: 'SC-2024-003',
    groupId: 'TG-005', // General
    title: 'Inspect HVAC unit',
    description: 'Inspect the server room HVAC unit for any malfunctions or failures.',
    status: 'completed',
    assignedEmployees: ['EMP-002'],
    estimatedHours: 1,
    sortOrder: 0,
    createdAt: '2024-12-08T16:30:00Z',
    completedAt: '2024-12-08T18:00:00Z',
  },
  {
    id: 'TK-005',
    serviceCallId: 'SC-2024-003',
    groupId: 'TG-005', // General
    title: 'Replace HVAC filter and clean unit',
    description: 'Replace clogged filter and perform general maintenance on HVAC unit.',
    status: 'completed',
    assignedEmployees: ['EMP-002', 'EMP-003'],
    estimatedHours: 2,
    sortOrder: 1,
    createdAt: '2024-12-09T08:00:00Z',
    completedAt: '2024-12-09T10:00:00Z',
  },
]

// Time Entries
export const timeEntries: TimeEntry[] = [
  {
    id: 'TE-001',
    taskId: 'TK-001',
    employeeId: 'EMP-001',
    date: '2024-12-10',
    hours: 2.5,
    rateType: 'regular',
    notes: 'Diagnosed network issues, identified faulty switch.',
    billable: true,
  },
  {
    id: 'TE-002',
    taskId: 'TK-002',
    employeeId: 'EMP-001',
    date: '2024-12-10',
    hours: 1.5,
    rateType: 'regular',
    notes: 'Started switch replacement, waiting for parts.',
    billable: true,
  },
  {
    id: 'TE-003',
    taskId: 'TK-002',
    employeeId: 'EMP-002',
    date: '2024-12-10',
    hours: 1.5,
    rateType: 'regular',
    notes: 'Assisted with cable management during switch prep.',
    billable: true,
  },
  {
    id: 'TE-004',
    taskId: 'TK-004',
    employeeId: 'EMP-002',
    date: '2024-12-08',
    hours: 1.5,
    rateType: 'overtime',
    notes: 'Emergency inspection after hours.',
    billable: true,
  },
  {
    id: 'TE-005',
    taskId: 'TK-005',
    employeeId: 'EMP-002',
    date: '2024-12-09',
    hours: 1.5,
    rateType: 'regular',
    notes: 'Replaced filter and cleaned condenser.',
    billable: true,
  },
  {
    id: 'TE-006',
    taskId: 'TK-005',
    employeeId: 'EMP-003',
    date: '2024-12-09',
    hours: 1.5,
    rateType: 'regular',
    notes: 'Assisted with HVAC maintenance.',
    billable: true,
  },
]

// Material Usage
export const materialUsages: MaterialUsage[] = [
  {
    id: 'MU-001',
    taskId: 'TK-002',
    materialName: '24-Port Managed Network Switch',
    quantity: 1,
    unit: 'pcs',
    unitCost: 450,
    source: 'purchased',
  },
  {
    id: 'MU-002',
    taskId: 'TK-002',
    materialName: 'CAT6 Network Cable',
    quantity: 50,
    unit: 'm',
    unitCost: 1.5,
    source: 'stock',
  },
  {
    id: 'MU-003',
    taskId: 'TK-002',
    materialName: 'RJ45 Connectors',
    quantity: 20,
    unit: 'pcs',
    unitCost: 0.5,
    source: 'stock',
  },
  {
    id: 'MU-004',
    taskId: 'TK-005',
    materialName: 'HVAC Air Filter (20x25x1)',
    quantity: 2,
    unit: 'pcs',
    unitCost: 25,
    source: 'stock',
  },
  {
    id: 'MU-005',
    taskId: 'TK-005',
    materialName: 'Coil Cleaner Solution',
    quantity: 1,
    unit: 'L',
    unitCost: 35,
    source: 'stock',
  },
]

// Invoices
export const invoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    invoiceNumber: 'INV-2024-001',
    serviceCallId: 'SC-2024-003',
    customerId: 'CUST-003',
    status: 'sent',
    subtotal: 306.25,
    taxAmount: 27.56,
    totalAmount: 333.81,
    issuedDate: '2024-12-09',
    dueDate: '2024-12-24',
  },
]

// Purchase Orders
export const purchaseOrders: PurchaseOrder[] = []

// PO Line Items
export const poLineItems: POLineItem[] = []

// Invoice Line Items
export const invoiceLineItems: InvoiceLineItem[] = [
  {
    id: 'ILI-001',
    invoiceId: 'INV-2024-001',
    type: 'labor',
    description: 'HVAC Inspection - Emergency (Overtime)',
    quantity: 1.5,
    unitPrice: 82.5,
    totalPrice: 123.75,
    taskId: 'TK-004',
  },
  {
    id: 'ILI-002',
    invoiceId: 'INV-2024-001',
    type: 'labor',
    description: 'HVAC Maintenance - Filter Replacement',
    quantity: 3,
    unitPrice: 50,
    totalPrice: 150,
    taskId: 'TK-005',
  },
  {
    id: 'ILI-003',
    invoiceId: 'INV-2024-001',
    type: 'material',
    description: 'HVAC Air Filter (20x25x1)',
    quantity: 2,
    unitPrice: 25,
    totalPrice: 50,
    taskId: 'TK-005',
  },
  {
    id: 'ILI-004',
    invoiceId: 'INV-2024-001',
    type: 'material',
    description: 'Coil Cleaner Solution',
    quantity: 1,
    unitPrice: 35,
    totalPrice: 35,
    taskId: 'TK-005',
  },
]

// Helper functions to get related data
export function getTasksForServiceCall(serviceCallId: string): Task[] {
  return tasks.filter((t) => t.serviceCallId === serviceCallId)
}

export function getTimeEntriesForTask(taskId: string): TimeEntry[] {
  return timeEntries.filter((te) => te.taskId === taskId)
}

export function getMaterialsForTask(taskId: string): MaterialUsage[] {
  return materialUsages.filter((mu) => mu.taskId === taskId)
}

export function getLineItemsForInvoice(invoiceId: string): InvoiceLineItem[] {
  return invoiceLineItems.filter((li) => li.invoiceId === invoiceId)
}

export function getSiteById(siteId: string): Site | undefined {
  return sites.find((s) => s.id === siteId)
}

export function getEmployeeById(employeeId: string): Employee | undefined {
  return employees.find((e) => e.id === employeeId)
}

export function getSupplierById(supplierId: string): Supplier | undefined {
  return suppliers.find((s) => s.id === supplierId)
}

export function getCustomerById(customerId: string): Customer | undefined {
  return customers.find((c) => c.id === customerId)
}

export function getCustomerForSite(siteId: string): Customer | undefined {
  const site = getSiteById(siteId)
  if (!site) return undefined
  return getCustomerById(site.customerId)
}

export function getTaskGroupsForServiceCall(serviceCallId: string): TaskGroup[] {
  return taskGroups.filter((tg) => tg.serviceCallId === serviceCallId).sort((a, b) => a.sortOrder - b.sortOrder)
}
