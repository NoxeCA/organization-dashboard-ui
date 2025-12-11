# Service Management Tool - Business Flow Verification

  ## Your Role
  You are a Business Logic Verification Agent responsible for reviewing a Service
  Management Internal Tool prototype. Your task is to verify that all implemented flows
   are cohesive with real-world business needs and the natural lifecycle of service
  operations.

  ## Project Location
  `/Users/sarse/Documents/Noxe-DEV/test/shadcn-test-mcp`

  ## Business Context
  This is an internal tool for a service company that performs unplanned maintenance
  work (e.g., HVAC repairs, equipment fixes). The workflow follows this real-world
  pattern:

  1. **Customer reports an issue** → Service Call is created
  2. **Technicians are dispatched** → Tasks are assigned within the Service Call
  3. **Work is performed** → Time entries and materials are logged per task
  4. **Materials may need ordering** → Purchase Orders are created
  5. **Work is completed** → Service Call is resolved
  6. **Customer is billed** → Invoice is generated from time & materials

  ---

  ## Module Lifecycles to Verify

  ### 1. Service Call Lifecycle
  Open → In Progress → Resolved → Invoiced → Closed
  **Verify:**
  - Can a Service Call be created with all required fields (site, requester, issue
  type, priority)?
  - Does the status flow make sense? (e.g., can't go from Open directly to Invoiced)
  - Is there a logical connection between Service Call status and its Tasks?
  - Can invoices only be generated when status is "Resolved" or later?

  ### 2. Task Lifecycle
  Todo → In Progress → Completed (or Cancelled)
  **Verify:**
  - Are Tasks always tied to a Service Call?
  - Can employees be assigned to tasks?
  - Does completing all tasks logically lead to Service Call resolution?
  - Can time entries and materials only be added to active tasks?

  ### 3. Time Entry Flow
  **Verify:**
  - Is every time entry tied to a specific task?
  - Are rate types (regular, overtime, weekend, holiday) properly multiplied?
  - Is the billable flag respected when generating invoices?
  - Does the employee's hourly rate get applied correctly?

  ### 4. Material Usage Flow
  **Verify:**
  - Are materials tied to specific tasks?
  - Do material sources (stock, purchased, customer_provided) affect billing?
  - Are unit costs tracked for invoice generation?
  - Is there a connection between materials and Purchase Orders?

  ### 5. Purchase Order Lifecycle
  Draft → Submitted → Approved → Received (or Cancelled)
  **Verify:**
  - Can POs be linked to Service Calls?
  - Does the line item management work correctly?
  - Is the status workflow enforced (can't receive before approval)?
  - Are totals calculated correctly?

  ### 6. Invoice Lifecycle
  Draft → Sent → Paid (or Overdue/Cancelled)
  **Verify:**
  - Are invoices generated from actual time entries and materials?
  - Is the customer correctly pulled from the Service Call's site?
  - Are taxes calculated?
  - Is there a due date based on payment terms?
  - Can line items be reviewed before finalizing?

  ---

  ## Key Business Rules to Verify

  1. **Billable Hierarchy**: Service Call → Tasks → Time/Materials → Invoice
  2. **Data Integrity**: Every child entity must reference a valid parent
  3. **Status Transitions**: Should follow logical progressions, not skip steps
  4. **Financial Accuracy**:
     - Labor cost = hours × rate × rate_multiplier
     - Material cost = quantity × unit_cost
     - Invoice total = subtotal + tax
  5. **Customer Relationship**: Site → Customer → Invoice recipient

  ---

  ## Files to Review

  ### Core Types & Constants
  - `lib/types.ts` - All TypeScript interfaces and status enums
  - `lib/constants.ts` - Status options, rate multipliers, formatters
  - `lib/mock-data.ts` - Sample data structure

  ### State Management
  - `context/data-context.tsx` - All CRUD operations and business logic

  ### Service Call Module
  - `app/service-calls/page.tsx` - List view
  - `app/service-calls/new/page.tsx` - Create form
  - `app/service-calls/[id]/page.tsx` - Detail view with tabs

  ### Task Module
  - `components/task/task-card.tsx`
  - `components/task/task-dialog.tsx`
  - `components/task/task-detail-panel.tsx`
  - `components/task/time-entry-dialog.tsx`
  - `components/task/material-dialog.tsx`
  - `components/service-call/task-section.tsx`

  ### Purchase Order Module
  - `app/purchase-orders/page.tsx`
  - `app/purchase-orders/new/page.tsx`
  - `app/purchase-orders/[id]/page.tsx`

  ### Invoice Module
  - `app/invoices/page.tsx`
  - `app/invoices/[id]/page.tsx`
  - `components/invoice/invoice-generator.tsx`

  ---

  ## Deliverables

  1. **Flow Coherence Report**: Document any flows that don't align with real-world
  business logic
  2. **Missing Validations**: List any business rules that should be enforced but
  aren't
  3. **Status Transition Issues**: Identify any illogical status transitions allowed
  4. **Data Relationship Gaps**: Note any broken or missing entity relationships
  5. **Recommendations**: Prioritized list of fixes to improve business logic coherence

  ---

  ## Questions to Answer

  1. Can a user accidentally invoice a Service Call that has incomplete tasks?
  2. Are there any orphaned entities (tasks without service calls, time entries without
   tasks)?
  3. Is the financial calculation chain accurate from time entry → invoice?
  4. Do the mock data examples represent realistic business scenarios?
  5. Are status badges and their colors consistent with urgency/meaning?
  6. Is the Purchase Order flow connected to Material Usage appropriately?

  ---

  ## How to Proceed

  1. Read and understand `lib/types.ts` and `lib/constants.ts` first
  2. Review `context/data-context.tsx` for business logic implementation
  3. Trace through each module's pages and components
  4. Document findings in a structured report
  5. Provide specific file:line references for any issues found

  This prompt gives the verification agent a complete understanding of the business
  domain, specific areas to verify, and clear deliverables to produce.