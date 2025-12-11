'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type {
  ServiceCall,
  Task,
  TimeEntry,
  MaterialUsage,
  PurchaseOrder,
  POLineItem,
  Invoice,
  InvoiceLineItem,
  Site,
  Employee,
  Supplier,
  Customer,
  ServiceCallFormData,
  TaskFormData,
  TimeEntryFormData,
  MaterialUsageFormData,
  POFormData,
} from '@/lib/types'
import {
  serviceCalls as initialServiceCalls,
  tasks as initialTasks,
  timeEntries as initialTimeEntries,
  materialUsages as initialMaterialUsages,
  purchaseOrders as initialPurchaseOrders,
  poLineItems as initialPoLineItems,
  invoices as initialInvoices,
  invoiceLineItems as initialInvoiceLineItems,
  sites,
  employees,
  suppliers,
  customers,
} from '@/lib/mock-data'

interface DataContextType {
  // Reference data (read-only)
  sites: Site[]
  employees: Employee[]
  suppliers: Supplier[]
  customers: Customer[]

  // Service Calls
  serviceCalls: ServiceCall[]
  addServiceCall: (data: ServiceCallFormData) => ServiceCall
  updateServiceCall: (id: string, data: Partial<ServiceCall>) => void
  deleteServiceCall: (id: string) => void
  getServiceCall: (id: string) => ServiceCall | undefined

  // Tasks
  tasks: Task[]
  addTask: (serviceCallId: string, data: TaskFormData) => Task
  updateTask: (id: string, data: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksForServiceCall: (serviceCallId: string) => Task[]

  // Time Entries
  timeEntries: TimeEntry[]
  addTimeEntry: (taskId: string, data: TimeEntryFormData) => TimeEntry
  updateTimeEntry: (id: string, data: Partial<TimeEntry>) => void
  deleteTimeEntry: (id: string) => void
  getTimeEntriesForTask: (taskId: string) => TimeEntry[]

  // Material Usage
  materialUsages: MaterialUsage[]
  addMaterialUsage: (taskId: string, data: MaterialUsageFormData) => MaterialUsage
  updateMaterialUsage: (id: string, data: Partial<MaterialUsage>) => void
  deleteMaterialUsage: (id: string) => void
  getMaterialsForTask: (taskId: string) => MaterialUsage[]

  // Purchase Orders
  purchaseOrders: PurchaseOrder[]
  poLineItems: POLineItem[]
  addPurchaseOrder: (data: POFormData) => PurchaseOrder
  updatePurchaseOrder: (id: string, data: Partial<PurchaseOrder>) => void
  deletePurchaseOrder: (id: string) => void
  getPurchaseOrder: (id: string) => PurchaseOrder | undefined
  getLineItemsForPO: (poId: string) => POLineItem[]

  // Invoices
  invoices: Invoice[]
  invoiceLineItems: InvoiceLineItem[]
  addInvoice: (serviceCallId: string, lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId'>[]) => Invoice
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  getInvoice: (id: string) => Invoice | undefined
  getLineItemsForInvoice: (invoiceId: string) => InvoiceLineItem[]
  getInvoicesForServiceCall: (serviceCallId: string) => Invoice[]
}

const DataContext = createContext<DataContextType | undefined>(undefined)

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function DataProvider({ children }: { children: ReactNode }) {
  // State
  const [serviceCallsState, setServiceCalls] = useState<ServiceCall[]>(initialServiceCalls)
  const [tasksState, setTasks] = useState<Task[]>(initialTasks)
  const [timeEntriesState, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries)
  const [materialUsagesState, setMaterialUsages] = useState<MaterialUsage[]>(initialMaterialUsages)
  const [purchaseOrdersState, setPurchaseOrders] = useState<PurchaseOrder[]>(initialPurchaseOrders)
  const [poLineItemsState, setPoLineItems] = useState<POLineItem[]>(initialPoLineItems)
  const [invoicesState, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [invoiceLineItemsState, setInvoiceLineItems] = useState<InvoiceLineItem[]>(initialInvoiceLineItems)

  // Service Call operations
  const addServiceCall = useCallback((data: ServiceCallFormData): ServiceCall => {
    const now = new Date().toISOString()
    const newServiceCall: ServiceCall = {
      id: generateId('SC'),
      ...data,
      status: 'open',
      attachments: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'EMP-001', // Default user
    }
    setServiceCalls((prev) => [...prev, newServiceCall])
    return newServiceCall
  }, [])

  const updateServiceCall = useCallback((id: string, data: Partial<ServiceCall>) => {
    setServiceCalls((prev) =>
      prev.map((sc) =>
        sc.id === id ? { ...sc, ...data, updatedAt: new Date().toISOString() } : sc
      )
    )
  }, [])

  const deleteServiceCall = useCallback((id: string) => {
    setServiceCalls((prev) => prev.filter((sc) => sc.id !== id))
  }, [])

  const getServiceCall = useCallback(
    (id: string) => serviceCallsState.find((sc) => sc.id === id),
    [serviceCallsState]
  )

  // Task operations
  const addTask = useCallback((serviceCallId: string, data: TaskFormData): Task => {
    const newTask: Task = {
      id: generateId('TK'),
      serviceCallId,
      ...data,
      status: 'todo',
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    return newTask
  }, [])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const updated = { ...task, ...data }
          if (data.status === 'completed' && !task.completedAt) {
            updated.completedAt = new Date().toISOString()
          }
          return updated
        }
        return task
      })
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [])

  const getTasksForServiceCall = useCallback(
    (serviceCallId: string) => tasksState.filter((t) => t.serviceCallId === serviceCallId),
    [tasksState]
  )

  // Time Entry operations
  const addTimeEntry = useCallback((taskId: string, data: TimeEntryFormData): TimeEntry => {
    const newEntry: TimeEntry = {
      id: generateId('TE'),
      taskId,
      ...data,
    }
    setTimeEntries((prev) => [...prev, newEntry])
    return newEntry
  }, [])

  const updateTimeEntry = useCallback((id: string, data: Partial<TimeEntry>) => {
    setTimeEntries((prev) => prev.map((te) => (te.id === id ? { ...te, ...data } : te)))
  }, [])

  const deleteTimeEntry = useCallback((id: string) => {
    setTimeEntries((prev) => prev.filter((te) => te.id !== id))
  }, [])

  const getTimeEntriesForTask = useCallback(
    (taskId: string) => timeEntriesState.filter((te) => te.taskId === taskId),
    [timeEntriesState]
  )

  // Material Usage operations
  const addMaterialUsage = useCallback((taskId: string, data: MaterialUsageFormData): MaterialUsage => {
    const newUsage: MaterialUsage = {
      id: generateId('MU'),
      taskId,
      ...data,
    }
    setMaterialUsages((prev) => [...prev, newUsage])
    return newUsage
  }, [])

  const updateMaterialUsage = useCallback((id: string, data: Partial<MaterialUsage>) => {
    setMaterialUsages((prev) => prev.map((mu) => (mu.id === id ? { ...mu, ...data } : mu)))
  }, [])

  const deleteMaterialUsage = useCallback((id: string) => {
    setMaterialUsages((prev) => prev.filter((mu) => mu.id !== id))
  }, [])

  const getMaterialsForTask = useCallback(
    (taskId: string) => materialUsagesState.filter((mu) => mu.taskId === taskId),
    [materialUsagesState]
  )

  // Purchase Order operations
  const addPurchaseOrder = useCallback((data: POFormData): PurchaseOrder => {
    const poId = generateId('PO')
    const poNumber = `PO-${new Date().getFullYear()}-${String(purchaseOrdersState.length + 1).padStart(3, '0')}`

    // Calculate total from line items
    const totalAmount = data.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    const newPO: PurchaseOrder = {
      id: poId,
      poNumber,
      supplierId: data.supplierId,
      serviceCallId: data.serviceCallId,
      expectedDelivery: data.expectedDelivery,
      status: 'draft',
      totalAmount,
      createdAt: new Date().toISOString(),
    }

    // Create line items
    const newLineItems: POLineItem[] = data.lineItems.map((item, index) => ({
      id: `${poId}-LI-${index + 1}`,
      purchaseOrderId: poId,
      materialName: item.materialName,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
    }))

    setPurchaseOrders((prev) => [...prev, newPO])
    setPoLineItems((prev) => [...prev, ...newLineItems])
    return newPO
  }, [purchaseOrdersState.length])

  const updatePurchaseOrder = useCallback((id: string, data: Partial<PurchaseOrder>) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => {
        if (po.id === id) {
          const updated = { ...po, ...data }
          if (data.status === 'received' && !po.receivedAt) {
            updated.receivedAt = new Date().toISOString()
          }
          return updated
        }
        return po
      })
    )
  }, [])

  const deletePurchaseOrder = useCallback((id: string) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== id))
    setPoLineItems((prev) => prev.filter((li) => li.purchaseOrderId !== id))
  }, [])

  const getPurchaseOrder = useCallback(
    (id: string) => purchaseOrdersState.find((po) => po.id === id),
    [purchaseOrdersState]
  )

  const getLineItemsForPO = useCallback(
    (poId: string) => poLineItemsState.filter((li) => li.purchaseOrderId === poId),
    [poLineItemsState]
  )

  // Invoice operations
  const addInvoice = useCallback(
    (serviceCallId: string, lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId'>[]): Invoice => {
      const invoiceId = generateId('INV')
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoicesState.length + 1).padStart(3, '0')}`

      const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const taxAmount = subtotal * 0.09 // 9% tax
      const totalAmount = subtotal + taxAmount

      const serviceCall = serviceCallsState.find((sc) => sc.id === serviceCallId)
      const site = sites.find((s) => s.id === serviceCall?.siteId)

      const newInvoice: Invoice = {
        id: invoiceId,
        invoiceNumber,
        serviceCallId,
        customerId: site?.customerId || '',
        status: 'draft',
        subtotal,
        taxAmount,
        totalAmount,
        issuedDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 days
      }

      const newLineItems: InvoiceLineItem[] = lineItems.map((item, index) => ({
        id: `${invoiceId}-LI-${index + 1}`,
        invoiceId,
        ...item,
      }))

      setInvoices((prev) => [...prev, newInvoice])
      setInvoiceLineItems((prev) => [...prev, ...newLineItems])

      // Update service call status to invoiced
      updateServiceCall(serviceCallId, { status: 'invoiced' })

      return newInvoice
    },
    [invoicesState.length, serviceCallsState, updateServiceCall]
  )

  const updateInvoice = useCallback((id: string, data: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data } : inv)))
  }, [])

  const deleteInvoice = useCallback((id: string) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    setInvoiceLineItems((prev) => prev.filter((li) => li.invoiceId !== id))
  }, [])

  const getInvoice = useCallback(
    (id: string) => invoicesState.find((inv) => inv.id === id),
    [invoicesState]
  )

  const getLineItemsForInvoice = useCallback(
    (invoiceId: string) => invoiceLineItemsState.filter((li) => li.invoiceId === invoiceId),
    [invoiceLineItemsState]
  )

  const getInvoicesForServiceCall = useCallback(
    (serviceCallId: string) => invoicesState.filter((inv) => inv.serviceCallId === serviceCallId),
    [invoicesState]
  )

  const value: DataContextType = {
    // Reference data
    sites,
    employees,
    suppliers,
    customers,

    // Service Calls
    serviceCalls: serviceCallsState,
    addServiceCall,
    updateServiceCall,
    deleteServiceCall,
    getServiceCall,

    // Tasks
    tasks: tasksState,
    addTask,
    updateTask,
    deleteTask,
    getTasksForServiceCall,

    // Time Entries
    timeEntries: timeEntriesState,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getTimeEntriesForTask,

    // Material Usage
    materialUsages: materialUsagesState,
    addMaterialUsage,
    updateMaterialUsage,
    deleteMaterialUsage,
    getMaterialsForTask,

    // Purchase Orders
    purchaseOrders: purchaseOrdersState,
    poLineItems: poLineItemsState,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrder,
    getLineItemsForPO,

    // Invoices
    invoices: invoicesState,
    invoiceLineItems: invoiceLineItemsState,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    getLineItemsForInvoice,
    getInvoicesForServiceCall,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData(): DataContextType {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
