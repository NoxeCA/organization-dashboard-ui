'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { toast } from 'sonner'
import type {
  ServiceCall,
  Task,
  TaskGroup,
  TimeEntry,
  MaterialUsage,
  Invoice,
  InvoiceLineItem,
  PurchaseOrder,
  POLineItem,
  Site,
  Employee,
  Supplier,
  Customer,
  ServiceCallFormData,
  TaskFormData,
  TaskGroupFormData,
  TimeEntryFormData,
  MaterialUsageFormData,
  POFormData,
  ServiceCallStatus,
  TaskStatus,
} from '@/lib/types'
import {
  serviceCalls as initialServiceCalls,
  tasks as initialTasks,
  taskGroups as initialTaskGroups,
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
import { DEFAULT_GROUP_COLOR } from '@/lib/constants'
import { SERVICE_CALL_TRANSITIONS, TASK_TRANSITIONS } from '@/lib/constants'

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

  // Task Groups
  taskGroups: TaskGroup[]
  addTaskGroup: (serviceCallId: string, data: TaskGroupFormData) => TaskGroup
  updateTaskGroup: (id: string, data: Partial<TaskGroup>) => void
  deleteTaskGroup: (id: string) => void
  getTaskGroupsForServiceCall: (serviceCallId: string) => TaskGroup[]
  ensureDefaultGroup: (serviceCallId: string) => TaskGroup
  reorderTaskGroups: (serviceCallId: string, groupIds: string[]) => void
  moveTaskToGroup: (taskId: string, groupId: string) => void
  reorderTasksInGroup: (groupId: string, taskIds: string[]) => void
  toggleGroupCollapse: (groupId: string) => void
  getTasksForGroup: (groupId: string) => Task[]

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
  const [taskGroupsState, setTaskGroups] = useState<TaskGroup[]>(initialTaskGroups)
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
      prev.map((sc) => {
        if (sc.id !== id) return sc

        // Validate status transition
        if (data.status && data.status !== sc.status) {
          const validTransitions = SERVICE_CALL_TRANSITIONS[sc.status]
          if (!validTransitions.includes(data.status)) {
            toast.error(`Cannot change status from "${sc.status}" to "${data.status}". Valid transitions: ${validTransitions.length > 0 ? validTransitions.join(', ') : 'none'}`)
            return sc // Return unchanged
          }

          // Check task completion when transitioning to 'resolved'
          if (data.status === 'resolved') {
            const serviceTasks = tasksState.filter(t => t.serviceCallId === id)
            const incompleteTasks = serviceTasks.filter(t =>
              !['completed', 'cancelled'].includes(t.status)
            )

            if (incompleteTasks.length > 0) {
              toast.error(`Cannot resolve: ${incompleteTasks.length} task(s) still incomplete. Complete or cancel all tasks first.`)
              return sc // Return unchanged
            }
          }
        }

        return { ...sc, ...data, updatedAt: new Date().toISOString() }
      })
    )
  }, [tasksState])

  const deleteServiceCall = useCallback((id: string) => {
    // Get related task IDs first
    const relatedTaskIds = tasksState
      .filter(t => t.serviceCallId === id)
      .map(t => t.id)

    // Delete time entries for those tasks
    setTimeEntries(prev => prev.filter(te => !relatedTaskIds.includes(te.taskId)))

    // Delete materials for those tasks
    setMaterialUsages(prev => prev.filter(mu => !relatedTaskIds.includes(mu.taskId)))

    // Delete tasks
    setTasks(prev => prev.filter(t => t.serviceCallId !== id))

    // Delete related purchase orders
    setPurchaseOrders(prev => prev.filter(po => po.serviceCallId !== id))

    // Delete related invoices and their line items
    const relatedInvoiceIds = invoicesState
      .filter(inv => inv.serviceCallId === id)
      .map(inv => inv.id)
    setInvoiceLineItems(prev => prev.filter(li => !relatedInvoiceIds.includes(li.invoiceId)))
    setInvoices(prev => prev.filter(inv => inv.serviceCallId !== id))

    // Finally delete the service call
    setServiceCalls(prev => prev.filter(sc => sc.id !== id))

    toast.success('Service call and all related records deleted')
  }, [tasksState, invoicesState])

  const getServiceCall = useCallback(
    (id: string) => serviceCallsState.find((sc) => sc.id === id),
    [serviceCallsState]
  )

  // Task operations
  const addTask = useCallback((serviceCallId: string, data: TaskFormData): Task => {
    // Determine which group to put the task in
    let targetGroupId = data.groupId
    if (!targetGroupId) {
      // Find default group for this service call
      const defaultGroup = taskGroupsState.find(
        (g) => g.serviceCallId === serviceCallId && g.isDefault
      )
      targetGroupId = defaultGroup?.id
    }

    // Calculate sort order within the group
    const tasksInGroup = tasksState.filter((t) => t.groupId === targetGroupId)
    const maxSortOrder = tasksInGroup.reduce((max, t) => Math.max(max, t.sortOrder ?? -1), -1)

    const newTask: Task = {
      id: generateId('TK'),
      serviceCallId,
      groupId: targetGroupId,
      title: data.title,
      description: data.description,
      assignedEmployees: data.assignedEmployees,
      estimatedHours: data.estimatedHours,
      status: 'todo',
      sortOrder: maxSortOrder + 1,
      createdAt: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    return newTask
  }, [taskGroupsState, tasksState])

  const updateTask = useCallback((id: string, data: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task

        // Validate status transition
        if (data.status && data.status !== task.status) {
          const validTransitions = TASK_TRANSITIONS[task.status]
          if (!validTransitions.includes(data.status as TaskStatus)) {
            toast.error(`Cannot change task status from "${task.status}" to "${data.status}". Valid transitions: ${validTransitions.length > 0 ? validTransitions.join(', ') : 'none (terminal state)'}`)
            return task // Return unchanged
          }
        }

        const updated = { ...task, ...data }
        if (data.status === 'completed' && !task.completedAt) {
          updated.completedAt = new Date().toISOString()
        }
        return updated
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

  // Task Group operations
  const ensureDefaultGroup = useCallback((serviceCallId: string): TaskGroup => {
    const existingDefault = taskGroupsState.find(
      (g) => g.serviceCallId === serviceCallId && g.isDefault
    )
    if (existingDefault) return existingDefault

    const newGroup: TaskGroup = {
      id: generateId('TG'),
      serviceCallId,
      name: 'General',
      color: '#64748B',
      sortOrder: 0,
      isDefault: true,
      isCollapsed: false,
      createdAt: new Date().toISOString(),
    }
    setTaskGroups((prev) => [...prev, newGroup])
    return newGroup
  }, [taskGroupsState])

  const addTaskGroup = useCallback((serviceCallId: string, data: TaskGroupFormData): TaskGroup => {
    // Get highest sortOrder for this service call
    const existingGroups = taskGroupsState.filter((g) => g.serviceCallId === serviceCallId)
    const maxSortOrder = existingGroups.reduce((max, g) => Math.max(max, g.sortOrder), -1)

    const newGroup: TaskGroup = {
      id: generateId('TG'),
      serviceCallId,
      name: data.name,
      color: data.color || DEFAULT_GROUP_COLOR,
      sortOrder: maxSortOrder + 1,
      isDefault: false,
      isCollapsed: false,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString(),
    }
    setTaskGroups((prev) => [...prev, newGroup])
    return newGroup
  }, [taskGroupsState])

  const updateTaskGroup = useCallback((id: string, data: Partial<TaskGroup>) => {
    setTaskGroups((prev) =>
      prev.map((group) => (group.id === id ? { ...group, ...data } : group))
    )
  }, [])

  const deleteTaskGroup = useCallback((id: string) => {
    const groupToDelete = taskGroupsState.find((g) => g.id === id)
    if (!groupToDelete) return

    // Prevent deleting default group
    if (groupToDelete.isDefault) {
      toast.error('Cannot delete the default group')
      return
    }

    // Find default group for this service call to move tasks to
    const defaultGroup = taskGroupsState.find(
      (g) => g.serviceCallId === groupToDelete.serviceCallId && g.isDefault
    )

    if (defaultGroup) {
      // Move tasks from deleted group to default group
      setTasks((prev) =>
        prev.map((task) =>
          task.groupId === id ? { ...task, groupId: defaultGroup.id } : task
        )
      )
    }

    setTaskGroups((prev) => prev.filter((g) => g.id !== id))
  }, [taskGroupsState])

  const getTaskGroupsForServiceCall = useCallback(
    (serviceCallId: string) =>
      taskGroupsState
        .filter((g) => g.serviceCallId === serviceCallId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [taskGroupsState]
  )

  const reorderTaskGroups = useCallback((serviceCallId: string, groupIds: string[]) => {
    setTaskGroups((prev) =>
      prev.map((group) => {
        if (group.serviceCallId !== serviceCallId) return group
        const newIndex = groupIds.indexOf(group.id)
        if (newIndex === -1) return group
        return { ...group, sortOrder: newIndex }
      })
    )
  }, [])

  const moveTaskToGroup = useCallback((taskId: string, groupId: string) => {
    // Get tasks in the target group to determine sort order
    const tasksInGroup = tasksState.filter((t) => t.groupId === groupId)
    const maxSortOrder = tasksInGroup.reduce((max, t) => Math.max(max, t.sortOrder ?? -1), -1)

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, groupId, sortOrder: maxSortOrder + 1 } : task
      )
    )
  }, [tasksState])

  const reorderTasksInGroup = useCallback((groupId: string, taskIds: string[]) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.groupId !== groupId) return task
        const newIndex = taskIds.indexOf(task.id)
        if (newIndex === -1) return task
        return { ...task, sortOrder: newIndex }
      })
    )
  }, [])

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setTaskGroups((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, isCollapsed: !group.isCollapsed } : group
      )
    )
  }, [])

  const getTasksForGroup = useCallback(
    (groupId: string) =>
      tasksState
        .filter((t) => t.groupId === groupId)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
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

    // Task Groups
    taskGroups: taskGroupsState,
    addTaskGroup,
    updateTaskGroup,
    deleteTaskGroup,
    getTaskGroupsForServiceCall,
    ensureDefaultGroup,
    reorderTaskGroups,
    moveTaskToGroup,
    reorderTasksInGroup,
    toggleGroupCollapse,
    getTasksForGroup,

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
