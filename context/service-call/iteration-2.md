# Service Call - Iteration 2
> Last Updated: 2025-12-03

## Business Context

Service Calls represent unplanned maintenance or configuration work in Noxe's customer service platform. They are the primary mechanism for tracking operational activities that fall outside structured project work.

Key business rules:
- Service Calls require an active Service Agreement (not yet enforced in code)
- Both Customers and Noxe Employees can create service calls
- Each service call spawns internal and external communication threads
- Service Calls contain Tasks which are the atomic unit of work execution
- Tasks can optionally be organized into Task Groups

Relationship to other domains:
- **Customer/Site**: Service calls are linked to a customer and specific site
- **Service Agreement**: Rates and terms come from the agreement (future iteration)
- **Invoicing**: Service calls are invoiced based on tasks, time entries, and materials

## Visual Documentation Analysis

**service_call_projects.png**: Illustrates the flexible structure where both Service Calls and Projects can contain:
- Multiple Task Groups with Tasks inside
- Single Task Group with Tasks
- Flat Tasks without grouping

**service_call_task_details.png**: Defines the data model:
- Service Call: Customer, Bill To, threads, priority, dates, summary (costs/prices), PO
- Task: Site, planned time, time entries, assignees, materials, description, internal thread, status, dates

## Current Implementation Status

### Features Implemented
- [x] Service Call list page with table/card views
- [x] Service Call detail page with task management
- [x] Create Service Call dialog with customer/site selection
- [x] Create Task dialog with employee assignment and group selection
- [x] Task detail sheet with time entries, materials, and group management
- [x] Internal and external communication threads (UI only)
- [x] Status and priority badges
- [x] Financial summary display on detail page
- [x] Statistics cards (open, in progress, urgent, resolved)
- [x] Task Groups with collapsible sections
- [x] Task group creation, editing, and deletion
- [x] **NEW: Card-based view grouped by status (Backlog, To Do, In Progress, Done)**
- [x] **NEW: Improved task card design with better visual hierarchy**
- [x] **NEW: Quick status change via context menu (right-click) on cards**
- [x] **NEW: Group filter dropdown to show all/specific groups**
- [x] **NEW: Table view with inline status change dropdown**

### Key Files
| File | Purpose |
|------|---------|
| `app/service-call/page.tsx` | List view with filters, stats, table/card toggle |
| `app/service-call/[id]/page.tsx` | Detail view with unified Kanban, group filter |
| `components/service-call/service-call-dialog.tsx` | Create service call form |
| `components/service-call/task-dialog.tsx` | Create task form with group selector |
| `components/service-call/task-detail-sheet.tsx` | Task editing with time/materials/group |
| `components/service-call/task-group-dialog.tsx` | Create/edit task group form |
| `components/service-call/task-card.tsx` | **NEW: Reusable task card component with context menu** |
| `components/service-call/communication-thread.tsx` | Chat UI for threads |
| `lib/types/service-call.ts` | TypeScript type definitions |
| `lib/mock-service-calls.ts` | Mock data for development |

### Data Model
Key entities:
- **ServiceCall**: Container for work requests, linked to customer/site, contains taskGroups
- **Task**: Atomic unit of work with assignments, time entries, materials
- **TaskGroup**: Named container for grouping related tasks
- **TimeEntry**: Billable/non-billable time logged against a task
- **Material**: Parts/equipment used or estimated for a task

Type definitions in `lib/types/service-call.ts`:
- `TaskGroup` interface with id, name, serviceCallId/projectId, tasks array
- `ServiceCall` includes optional `taskGroups` array
- Tasks have `serviceCallId` for direct association

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Card-based status grouping instead of Kanban | Simpler than drag-and-drop Kanban, sufficient for task management |
| Group shown as colored badge | Clear visual association without fragmenting the view |
| Group filter dropdown | Allows focusing on specific group without losing overall view |
| Context menu for status (Cards) | Faster workflow than opening task sheet to change status |
| Inline status dropdown (Table) | Click status cell to change, no context menu needed in table |
| Table view option | Better density and scannability for large task lists |
| Table columns: Task, Group, Status, Assignees, Due Date, Hours, Materials | Key info visible at a glance |
| Improved card hierarchy | Better scannability with clear name, description, metadata sections |
| Removed Kanban/drag-and-drop | Unnecessary complexity for this use case |

## What Was Explicitly Decided NOT To Do
| Decision | Reason |
|----------|--------|
| Service Agreement enforcement | Deferred to future iteration - requires agreement domain |
| Task-level internal threads | Lower priority - service call threads sufficient for now |
| Attachment uploads | Requires file storage infrastructure |
| Bill To management | Deferred - need to understand billing workflow better |
| Drag-and-drop task reordering | Adds complexity, not needed for basic task management |
| Mobile-responsive cards | Deferred - will address in dedicated mobile UX iteration |

## Technical Implementation Details

**Architecture patterns:**
- Client-side state management with React useState
- Mock data imported directly (to be replaced with API)
- shadcn/ui components for consistent UI
- Context menu for quick actions on cards

**Key dependencies:**
- react-hook-form + zod for form validation
- date-fns for date formatting
- lucide-react for icons
- @radix-ui/react-context-menu for right-click menus

**Component hierarchy:**
```
ServiceCallDetailPage
  -> TaskGroupDialog (create/edit)
  -> TaskDialog (create with group selection)
  -> GroupFilter dropdown
  -> TaskCardView (cards grouped by status)
       -> TaskCard (with group badge, context menu)
  -> TaskTableView (table with inline status change)
  -> TaskDetailSheet (edit task details)
  -> CommunicationThread (x2: internal/external)
  -> FinancialSummary
```

## Open Questions / Future Considerations

1. **Service Agreement Integration**: How should agreement validation work when creating service calls?
2. **Group reordering**: Should users be able to reorder groups in the filter dropdown?
3. **Group-level permissions**: Should some users only see certain task groups?
4. **Real-time updates**: Will threads and task status need WebSocket updates?
5. **Mobile experience**: Kanban may need alternate UX on small screens
6. **Bulk task operations**: Should users be able to select multiple tasks for bulk status change?
