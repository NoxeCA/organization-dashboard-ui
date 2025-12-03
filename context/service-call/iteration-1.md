# Service Call - Iteration 1
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
- [x] Service Call detail page with Kanban/list task views
- [x] Create Service Call dialog with customer/site selection
- [x] Create Task dialog with employee assignment and group selection
- [x] Task detail sheet with time entries, materials, and group management
- [x] Internal and external communication threads
- [x] Status and priority badges
- [x] Financial summary display on detail page
- [x] Statistics cards (open, in progress, urgent, resolved)
- [x] Task Groups with collapsible sections
- [x] Task Groups with embedded Kanban boards per group
- [x] Task group creation, editing, and deletion
- [x] Assigning tasks to groups during creation
- [x] Changing task groups in task detail sheet

### Key Files
| File | Purpose |
|------|---------|
| `app/service-call/page.tsx` | List view with filters, stats, table/card toggle |
| `app/service-call/[id]/page.tsx` | Detail view with grouped tasks, threads, financial info |
| `components/service-call/service-call-dialog.tsx` | Create service call form |
| `components/service-call/task-dialog.tsx` | Create task form with group selector |
| `components/service-call/task-detail-sheet.tsx` | Task editing with time/materials/group |
| `components/service-call/task-group-dialog.tsx` | Create/edit task group form |
| `components/service-call/task-group-section.tsx` | Collapsible section with embedded Kanban |
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
| Kanban + List view toggle | Provides flexibility for different user preferences |
| Sheet for task details | Non-blocking UI that allows quick edits without losing context |
| Separate internal/external threads | Business requirement for private team discussions |
| kibo-ui Kanban component | Pre-built drag-and-drop functionality |
| Collapsible group sections | Each group has its own Kanban for clear visual separation |
| Both drag-drop and dialog for group changes | Maximum flexibility for users |

## What Was Explicitly Decided NOT To Do
| Decision | Reason |
|----------|--------|
| Service Agreement enforcement | Deferred to future iteration - requires agreement domain |
| Task-level internal threads | Lower priority - service call threads sufficient for now |
| Attachment uploads | Requires file storage infrastructure |
| Bill To management | Deferred - need to understand billing workflow better |
| Cross-group drag and drop | Complex implementation - groups have separate Kanbans |

## Technical Implementation Details

**Architecture patterns:**
- Client-side state management with React useState
- Mock data imported directly (to be replaced with API)
- shadcn/ui components for consistent UI
- kibo-ui Kanban for drag-and-drop task board
- Radix Collapsible for group sections

**Key dependencies:**
- react-hook-form + zod for form validation
- date-fns for date formatting
- lucide-react for icons
- @dnd-kit (via kibo-ui) for drag-and-drop
- @radix-ui/react-collapsible for collapsible sections

**Component hierarchy:**
```
ServiceCallDetailPage
  -> TaskGroupDialog (create)
  -> TaskDialog (create with group selection)
  -> TaskGroupSection[] (one per group + ungrouped)
       -> Collapsible
       -> KanbanProvider + KanbanBoard
  -> TaskListView (alternative view)
  -> TaskDetailSheet (edit with group selection)
  -> CommunicationThread (x2: internal/external)
  -> FinancialSummary
```

## Open Questions / Future Considerations

1. **Service Agreement Integration**: How should agreement validation work when creating service calls?
2. **Cross-group task movement**: Should drag-and-drop work across groups or just within each group's Kanban?
3. **Group reordering**: Should users be able to reorder groups or are they fixed?
4. **Group-level permissions**: Should some users only see certain task groups?
5. **Real-time updates**: Will threads and task status need WebSocket updates?
6. **Mobile experience**: Current multi-Kanban layout may not work well on small screens
