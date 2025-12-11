# Business Flow Verification Report
## Service Management Internal Tool

**Date:** December 11, 2025
**Reviewer:** Claude Code (Business Logic Verification Agent)

---

## Executive Summary

After a thorough review of the codebase, I identified **15 business logic issues** across the Service Management Tool. The most critical findings relate to **missing status transition validations** and **premature invoice generation** that could allow users to invoice incomplete service calls.

| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Medium | 5 |
| Low | 5 |

---

## Table of Contents

1. [Flow Coherence Issues](#1-flow-coherence-issues)
2. [Missing Business Validations](#2-missing-business-validations)
3. [Status Transition Issues](#3-status-transition-issues)
4. [Data Relationship Gaps](#4-data-relationship-gaps)
5. [Financial Calculation Verification](#5-financial-calculation-verification)
6. [Answers to Key Questions](#6-answers-to-key-questions)
7. [Prioritized Recommendations](#7-prioritized-recommendations)
8. [Summary Table](#8-summary-table)

---

## 1. Flow Coherence Issues

### 1.1 Service Call Status Transitions (CRITICAL)

**File:** `context/data-context.tsx:126-132`
**Issue:** The `updateServiceCall` function allows ANY status change without validation.

```typescript
const updateServiceCall = useCallback((id: string, data: Partial<ServiceCall>) => {
  setServiceCalls((prev) =>
    prev.map((sc) =>
      sc.id === id ? { ...sc, ...data, updatedAt: new Date().toISOString() } : sc
    )
  )
}, [])
```

**Current behavior:** Users can change status from `open` → `invoiced` directly, skipping required intermediate states.

**Expected behavior:**
- `open` → `in_progress` → `resolved` → `invoiced` → `closed`
- Cannot skip steps (e.g., can't go from `open` to `resolved` without being `in_progress` first)
- Cannot reverse beyond the previous state

**Also affected:** `app/service-calls/[id]/page.tsx:107-114` - Status dialog allows selecting any status.

---

### 1.2 Task Status Transitions (HIGH)

**File:** `components/task/task-detail-panel.tsx:96-99`
**Issue:** Task status can be changed to ANY value without validation.

```typescript
const handleStatusChange = (newStatus: string) => {
  updateTask(task.id, { status: newStatus as Task['status'] })
  toast.success('Task status updated')
}
```

**Current behavior:** A task can go from `todo` → `completed` directly without passing through `in_progress`.

**Expected behavior:**
- `todo` → `in_progress` → `completed`
- `cancelled` tasks should not be able to transition back to active states
- Task completion should potentially trigger Service Call status review when all tasks are done

---

### 1.3 Invoice Generation Without Service Call Validation (CRITICAL)

**File:** `components/invoice/invoice-generator.tsx:60-106`
**Issue:** Invoices can be generated for Service Calls in ANY status.

```typescript
const initializeItems = () => {
  const tasks = getTasksForServiceCall(serviceCallId)
  // No validation of service call status here
  const billableItems: BillableItem[] = []
  // ...
}
```

**Current behavior:** A user can invoice a Service Call that is `open` with incomplete tasks.

**Expected behavior:** Invoice generation should only be allowed when:
1. Service Call status is `resolved` or later
2. All active tasks are `completed` (not just `in_progress`)

---

## 2. Missing Business Validations

### 2.1 Time Entry on Inactive Tasks (MEDIUM)

**File:** `components/task/time-entry-dialog.tsx:71-98`
**Issue:** Time entries can be added to `completed` or `cancelled` tasks.

```typescript
export function TimeEntryDialog({ open, onOpenChange, task }: TimeEntryDialogProps) {
  // No check for task.status before allowing time entry
  const { employees, addTimeEntry } = useData()
  // ...
}
```

**Expected:** Time should only be logged on tasks with status `todo` or `in_progress`.

---

### 2.2 Material Usage on Inactive Tasks (MEDIUM)

**File:** `components/task/material-dialog.tsx:77-86`
**Issue:** Materials can be added to `completed` or `cancelled` tasks.

```typescript
const onSubmit = (data: MaterialFormValues) => {
  try {
    addMaterialUsage(task.id, data)
    // No validation of task status
    toast.success('Material added successfully')
    // ...
  }
}
```

**Expected:** Materials should only be added to active tasks.

---

### 2.3 Customer-Provided Materials Billing (MEDIUM)

**File:** `components/invoice/invoice-generator.tsx:88-102`
**Issue:** Customer-provided materials (source: `customer_provided`) are included in invoice generation if they have a cost.

```typescript
materials
  .filter((m) => m.unitCost && m.unitCost > 0)
  // Missing: && m.source !== 'customer_provided'
  .forEach((m) => {
    billableItems.push({
      // ...
    })
  })
```

**Expected:** Customer-provided materials should NEVER be billed regardless of cost value.

---

### 2.4 Cancelled Tasks in Invoice (LOW)

**File:** `components/invoice/invoice-generator.tsx:64`
**Issue:** Invoice generator processes ALL tasks including cancelled ones.

```typescript
const initializeItems = () => {
  const tasks = getTasksForServiceCall(serviceCallId)
  // Should filter: tasks.filter(t => t.status === 'completed')
  // ...
}
```

**Expected:** Only `completed` tasks should contribute to invoices.

---

### 2.5 Purchase Order Status for Material Linking (LOW)

**File:** `components/task/material-dialog.tsx:227-256`
**Issue:** Materials can be linked to POs in any non-cancelled status (draft, submitted, approved, received).

```typescript
const relevantPOs = purchaseOrders.filter(
  po => po.serviceCallId === task.serviceCallId && po.status !== 'cancelled'
)
```

**Expected:** For billing accuracy, materials marked as `purchased` should only link to POs with status `approved` or `received`.

---

## 3. Status Transition Issues

### 3.1 Data Layer vs UI Layer Inconsistency

| Entity | UI Enforcement | Data Layer Enforcement |
|--------|---------------|----------------------|
| Service Call | None | None |
| Task | None | None |
| Purchase Order | Good (`[id]/page.tsx:131-150`) | None |
| Invoice | Good (`[id]/page.tsx:133-147`) | None |

**Issue:** While Purchase Order and Invoice UIs properly restrict status transitions via `getAvailableActions()`, the underlying `updatePurchaseOrder` and `updateInvoice` functions in `data-context.tsx` accept ANY status change.

**Purchase Order UI Enforcement (Good):**
```typescript
const getAvailableActions = () => {
  switch (po.status) {
    case 'draft':
      return [{ label: 'Submit', status: 'submitted' }]
    case 'submitted':
      return [
        { label: 'Approve', status: 'approved' },
        { label: 'Cancel', status: 'cancelled' },
      ]
    case 'approved':
      return [
        { label: 'Mark Received', status: 'received' },
        { label: 'Cancel', status: 'cancelled' },
      ]
    default:
      return []
  }
}
```

**Risk:** Direct API calls or developer console manipulation could bypass UI validations.

---

### 3.2 Recommended Status Transition Maps

**Service Call:**
```typescript
const SERVICE_CALL_TRANSITIONS: Record<ServiceCallStatus, ServiceCallStatus[]> = {
  open: ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'open'],
  resolved: ['invoiced', 'in_progress'],
  invoiced: ['closed'],
  closed: [], // Terminal state
}
```

**Task:**
```typescript
const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'todo', 'cancelled'],
  completed: [], // Terminal state (or allow reopen?)
  cancelled: [], // Terminal state
}
```

---

## 4. Data Relationship Gaps

### 4.1 Orphan Prevention

**Status:** GOOD

- Tasks require `serviceCallId` on creation (`data-context.tsx:144-154`)
- Time entries require `taskId` on creation (`data-context.tsx:181-189`)
- Materials require `taskId` on creation (`data-context.tsx:205-213`)

### 4.2 Cascade Delete Missing (MEDIUM)

**File:** `data-context.tsx:134-136`

```typescript
const deleteServiceCall = useCallback((id: string) => {
  setServiceCalls((prev) => prev.filter((sc) => sc.id !== id))
  // Missing: cascade delete tasks, time entries, materials, invoices
}, [])
```

**Issue:** Deleting a Service Call does not cascade delete:
- Related tasks
- Time entries on those tasks
- Materials on those tasks
- Related invoices

**Current behavior:** Orphaned records remain in state.

**Recommended fix:**
```typescript
const deleteServiceCall = useCallback((id: string) => {
  // Get related task IDs
  const relatedTaskIds = tasksState
    .filter(t => t.serviceCallId === id)
    .map(t => t.id)

  // Delete time entries for those tasks
  setTimeEntries(prev => prev.filter(te => !relatedTaskIds.includes(te.taskId)))

  // Delete materials for those tasks
  setMaterialUsages(prev => prev.filter(mu => !relatedTaskIds.includes(mu.taskId)))

  // Delete tasks
  setTasks(prev => prev.filter(t => t.serviceCallId !== id))

  // Delete invoices
  setInvoices(prev => prev.filter(inv => inv.serviceCallId !== id))

  // Delete the service call
  setServiceCalls(prev => prev.filter(sc => sc.id !== id))
}, [tasksState])
```

---

## 5. Financial Calculation Verification

### 5.1 Labor Cost Calculation

**File:** `components/task/task-detail-panel.tsx:83-88`

```typescript
const calculateTimeEntryCost = (entry: TimeEntry) => {
  const employee = employees.find(e => e.id === entry.employeeId)
  if (!employee) return 0
  const multiplier = RATE_MULTIPLIERS[entry.rateType] || 1
  return entry.hours * employee.hourlyRate * multiplier
}
```

**Status:** CORRECT - `hours * rate * multiplier`

### 5.2 Rate Multipliers

**File:** `lib/constants.ts:67-72`

```typescript
export const RATE_MULTIPLIERS: Record<RateType, number> = {
  regular: 1.0,
  overtime: 1.5,
  weekend: 1.5,
  holiday: 2.0,
}
```

| Rate Type | Multiplier | Industry Standard |
|-----------|------------|-------------------|
| Regular | 1.0x | 1.0x |
| Overtime | 1.5x | 1.5x |
| Weekend | 1.5x | 1.5x - 2.0x |
| Holiday | 2.0x | 1.5x - 2.5x |

**Status:** BUSINESS-APPROPRIATE

### 5.3 Tax Calculation

**File:** `data-context.tsx:300`

```typescript
const taxAmount = subtotal * 0.09 // 9% tax
```

**Status:** CORRECT - Hardcoded at 9%

**Note:** Consider making tax rate configurable for different jurisdictions.

### 5.4 Invoice Due Date

**File:** `data-context.tsx:316`

```typescript
dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
```

**Status:** CORRECT - Set to 15 days from issue date

**Note:** Consider making payment terms configurable per customer.

### 5.5 Invoice Line Item Calculation

**File:** `components/invoice/invoice-generator.tsx:71-73`

```typescript
const rateMultiplier = RATE_MULTIPLIERS[te.rateType]
const unitPrice = employee ? employee.hourlyRate * rateMultiplier : 0
const totalPrice = te.hours * unitPrice
```

**Status:** CORRECT - Matches task detail panel calculation

---

## 6. Answers to Key Questions

### Q1: Can a user accidentally invoice a Service Call that has incomplete tasks?

**Answer: YES (CRITICAL)**

`invoice-generator.tsx` has no validation on Service Call status or task completion states. Users can invoice an `open` Service Call with `todo` tasks.

**Evidence:**
- No status check in `initializeItems()` (line 60)
- No task status filter - all tasks processed (line 64)
- Button is always enabled if any billable items exist

---

### Q2: Are there any orphaned entities?

**Answer: POSSIBLE**

While creation enforces parent references, delete operations don't cascade.

| Delete Operation | Orphaned Entities |
|-----------------|-------------------|
| Delete Service Call | Tasks, Time Entries, Materials, Invoices |
| Delete Task | Time Entries, Materials |
| Delete PO | PO Line Items (handled), Material links (not handled) |
| Delete Invoice | Invoice Line Items (handled) |

---

### Q3: Is the financial calculation chain accurate from time entry → invoice?

**Answer: YES**

| Stage | Calculation | Status |
|-------|-------------|--------|
| Time Entry Cost | `hours * employeeRate * rateMultiplier` | Correct |
| Material Cost | `quantity * unitCost` | Correct |
| Invoice Subtotal | Sum of line item totals | Correct |
| Tax | `subtotal * 0.09` | Correct |
| Invoice Total | `subtotal + taxAmount` | Correct |

---

### Q4: Do the mock data examples represent realistic business scenarios?

**Answer: YES**

Mock data (`lib/mock-data.ts`) includes:

| Scenario | Realism |
|----------|---------|
| Multi-task service calls | Camera system with diagnosis + repair tasks |
| Mixed task statuses | Completed, in_progress, todo tasks |
| Various rate types | Regular and overtime time entries |
| Multiple material sources | Stock, purchased (with PO link) |
| Invoice with line items | Labor + materials properly itemized |
| Customer → Site relationship | Multiple sites per customer |

---

### Q5: Are status badges and their colors consistent with urgency/meaning?

**Answer: YES**

| Color | Meaning | Usage |
|-------|---------|-------|
| Gray | Inactive/Pending | `todo`, `draft`, `closed` |
| Blue | Active/In Progress | `in_progress`, `sent`, `submitted` |
| Yellow | Warning/Active Work | `in_progress` (service call) |
| Green | Success/Complete | `completed`, `resolved`, `paid`, `approved` |
| Orange | Warning/Attention | `overdue`, `high` priority |
| Red | Critical/Error | `cancelled`, `critical` priority |
| Purple | Special State | `invoiced`, `received` |

**Files:** `lib/constants.ts:21-27, 37-42, 52-57, 90-96, 107-113`

---

### Q6: Is the Purchase Order flow connected to Material Usage appropriately?

**Answer: PARTIALLY**

**What works:**
- Materials can link to POs via `purchaseOrderId` field
- Material dialog shows relevant POs filtered by Service Call

**Issues:**
1. Material source should automatically be `purchased` when linked to a PO
2. Only `approved` or `received` POs should be linkable for accuracy
3. No validation that PO line item matches material being linked

---

## 7. Prioritized Recommendations

### P0 - Critical (Must Fix Before Production)

#### 1. Add Service Call status validation to invoice generation

**File:** `components/invoice/invoice-generator.tsx`

```typescript
const handleOpen = () => {
  const serviceCall = getServiceCall(serviceCallId)

  if (!serviceCall || !['resolved', 'invoiced'].includes(serviceCall.status)) {
    toast.error('Service call must be resolved before invoicing')
    return
  }

  initializeItems()
  setDialogOpen(true)
}
```

#### 2. Add status transition validation in data context

**File:** `context/data-context.tsx`

```typescript
const VALID_SC_TRANSITIONS: Record<ServiceCallStatus, ServiceCallStatus[]> = {
  open: ['in_progress'],
  in_progress: ['resolved', 'open'],
  resolved: ['invoiced', 'in_progress'],
  invoiced: ['closed'],
  closed: [],
}

const updateServiceCall = useCallback((id: string, data: Partial<ServiceCall>) => {
  setServiceCalls((prev) =>
    prev.map((sc) => {
      if (sc.id !== id) return sc

      if (data.status && data.status !== sc.status) {
        const validTransitions = VALID_SC_TRANSITIONS[sc.status]
        if (!validTransitions.includes(data.status)) {
          throw new Error(`Invalid status transition: ${sc.status} → ${data.status}`)
        }
      }

      return { ...sc, ...data, updatedAt: new Date().toISOString() }
    })
  )
}, [])
```

---

### P1 - High Priority

#### 3. Validate task completion before Service Call resolution

```typescript
// In updateServiceCall, when transitioning to 'resolved':
if (data.status === 'resolved') {
  const tasks = tasksState.filter(t => t.serviceCallId === id)
  const incompleteTasks = tasks.filter(t =>
    t.status !== 'completed' && t.status !== 'cancelled'
  )
  if (incompleteTasks.length > 0) {
    throw new Error('Cannot resolve: incomplete tasks exist')
  }
}
```

#### 4. Restrict time/material entry to active tasks

**Files:** `time-entry-dialog.tsx`, `material-dialog.tsx`

```typescript
// Add at component start:
if (!['todo', 'in_progress'].includes(task.status)) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <p>Cannot add entries to {task.status} tasks</p>
      </DialogContent>
    </Dialog>
  )
}
```

#### 5. Exclude cancelled tasks from invoice generation

```typescript
const initializeItems = () => {
  const tasks = getTasksForServiceCall(serviceCallId)
    .filter(t => t.status === 'completed') // Only completed tasks
  // ...
}
```

---

### P2 - Medium Priority

#### 6. Exclude customer-provided materials from billing

```typescript
materials
  .filter((m) =>
    m.unitCost &&
    m.unitCost > 0 &&
    m.source !== 'customer_provided'
  )
```

#### 7. Add cascade delete for Service Calls

See implementation in [Section 4.2](#42-cascade-delete-missing-medium)

#### 8. Restrict PO linking to approved/received orders

```typescript
const relevantPOs = purchaseOrders.filter(
  po => po.serviceCallId === task.serviceCallId &&
        ['approved', 'received'].includes(po.status)
)
```

---

### P3 - Low Priority

9. **Add "Mark All Tasks Complete" helper** when resolving Service Call
10. **Add warning** when invoicing with incomplete/low billable items
11. **Add overdue invoice auto-detection** based on due date comparison
12. **Make tax rate configurable** per jurisdiction/customer
13. **Make payment terms configurable** per customer

---

## 8. Summary Table

| Module | Lifecycle Enforcement | Status Validation | Data Integrity | Financial Accuracy |
|--------|----------------------|-------------------|----------------|-------------------|
| Service Call | No enforcement | Missing | Good | N/A |
| Task | No enforcement | Missing | Good | N/A |
| Time Entry | N/A | No task status check | Good | Correct |
| Material | N/A | No task status check | Good | Correct |
| Purchase Order | UI enforced only | UI only | Good | Correct |
| Invoice | UI enforced only | No SC status check | Good | Correct |

---

## Appendix: Files Reviewed

| File | Purpose |
|------|---------|
| `lib/types.ts` | TypeScript interfaces and status enums |
| `lib/constants.ts` | Status options, rate multipliers, formatters |
| `lib/mock-data.ts` | Sample data structure |
| `context/data-context.tsx` | All CRUD operations and business logic |
| `app/service-calls/page.tsx` | Service Call list view |
| `app/service-calls/new/page.tsx` | Service Call creation form |
| `app/service-calls/[id]/page.tsx` | Service Call detail view |
| `components/service-call/task-section.tsx` | Task list within Service Call |
| `components/task/task-card.tsx` | Task card display |
| `components/task/task-dialog.tsx` | Task create/edit dialog |
| `components/task/task-detail-panel.tsx` | Task details with time/materials |
| `components/task/time-entry-dialog.tsx` | Time entry form |
| `components/task/material-dialog.tsx` | Material usage form |
| `app/purchase-orders/page.tsx` | PO list view |
| `app/purchase-orders/new/page.tsx` | PO creation form |
| `app/purchase-orders/[id]/page.tsx` | PO detail view |
| `app/invoices/page.tsx` | Invoice list view |
| `app/invoices/[id]/page.tsx` | Invoice detail view |
| `components/invoice/invoice-generator.tsx` | Invoice generation dialog |

---

*Report generated by Claude Code Business Logic Verification Agent*
