# Service Call - Iteration 3
> Last Updated: 2025-12-03

## Business Context
The Service Call domain manages work requests from customers. A service call groups multiple tasks that can be organized into task groups for better organization. Each task tracks time entries and materials used, contributing to the service call's financial summary.

Key business rules:
- Service calls belong to a customer and site
- Tasks can be grouped logically (e.g., "Diagnostics", "Hardware Repair", "Configuration")
- Tasks track planned vs actual time, materials with cost tracking
- Service calls flow through statuses: Open → In Progress → Resolved → Invoiced → Closed

## Visual Documentation Analysis
From `context/service_call_projects.png` and `context/service_call_task_details.png`:
- Project list shows task groups with collapsible sections
- Task details include financial breakdown (predicted material, estimated sell price, costs)
- Tasks can be moved between groups or ungrouped
- UI includes internal/external communication threads

## Current Implementation Status

### Features Implemented
- [x] Service call list page with filters (status, priority, search)
- [x] Service call detail page with comprehensive task management
- [x] Task cards with status, assignees, progress tracking
- [x] Task table view alternative
- [x] Task grouping with visual indicators (color-coded groups)
- [x] Task creation with group assignment
- [x] Task editing via detail sheet (status, description, time, materials)
- [x] Task status change via context menu
- [x] Task group creation
- [x] Financial summary (predicted material, costs)
- [x] Communication threads (internal/external) - UI only
- [x] **Task deletion with confirmation** (Iteration 3)
- [x] **Task group deletion with confirmation** (Iteration 3)
- [x] **Simplified Task-Group relationship via groupId** (Iteration 3)
- [x] **Centralized group color system** (Iteration 3)

### Key Files
| File | Purpose |
|------|---------|
| `app/service-call/page.tsx` | Service call list page |
| `app/service-call/[id]/page.tsx` | Service call detail with task management |
| `lib/types/service-call.ts` | Type definitions, status configs, group colors |
| `lib/mock-service-calls.ts` | Mock data for development |
| `components/service-call/task-card.tsx` | Task card component with context menu |
| `components/service-call/task-detail-sheet.tsx` | Full task editor sheet |
| `components/service-call/task-dialog.tsx` | Task creation dialog |
| `components/service-call/task-group-dialog.tsx` | Group creation/edit dialog |
| `components/service-call/communication-thread.tsx` | Chat UI component |

### Data Model
```typescript
// Task now has direct groupId reference (Iteration 3 change)
interface Task {
  id: string;
  name: string;
  description?: string;
  status: TaskStatus;
  serviceCallId?: string;
  groupId?: string; // Direct reference to TaskGroup.id (NEW)
  siteId: string;
  assignedEmployees: Employee[];
  timeEntries: TimeEntry[];
  materials: Material[];
  // ... dates, etc.
}

// TaskGroup simplified - no longer contains tasks array
interface TaskGroup {
  id: string;
  name: string;
  color?: string; // Optional custom color
  serviceCallId?: string;
}
```

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| Direct `groupId` on Task | Simplifies state management - no nested task arrays in groups. Tasks can be filtered by `groupId` easily. |
| Centralized `getGroupColor()` | Eliminates code duplication. Uses hash-based color assignment for consistent colors across sessions. |
| Group colors via hash | Dynamically created groups get consistent colors without manual assignment. |
| Tasks ungrouped on group delete | When deleting a group, tasks are moved to "Ungrouped" rather than deleted - preserves work. |
| AlertDialog for deletions | Requires explicit confirmation to prevent accidental data loss. |

## What Was Explicitly Decided NOT To Do
| Decision | Reason |
|----------|--------|
| Service Agreement validation | Not implemented yet - requires service agreement domain to be built first |
| Bill To field UI | Postponed - business clarification needed on when bill-to differs from customer |
| Task-level communication threads | Postponed - keeping communication at service call level for now |
| Drag-and-drop task ordering | Would add complexity; using status columns instead for workflow |
| Custom group color picker | Hash-based colors are sufficient; can add later if users request |

## Technical Implementation Details

### Architecture Patterns
- **State lifting**: Task and group state managed at detail page level, passed down to components
- **Optimistic UI**: State updates immediately, no backend calls (mock data)
- **AlertDialog pattern**: Used for all destructive actions (task delete, group delete)

### Key Dependencies
- date-fns for date formatting
- lucide-react for icons
- shadcn/ui components: Sheet, Dialog, AlertDialog, Tabs, Select, DropdownMenu

### Component Hierarchy
```
ServiceCallDetailPage
├── TaskCardView / TaskTableView
│   └── TaskCard (with context menu)
├── TaskDetailSheet (for editing)
├── TaskDialog (for creation)
├── TaskGroupDialog (for group management)
└── CommunicationThread (x2: internal/external)
```

### Group Color System (Iteration 3)
```typescript
// Centralized in lib/types/service-call.ts
export const GROUP_COLOR_PALETTE = [
  "bg-blue-500", "bg-orange-500", "bg-purple-500",
  "bg-emerald-500", "bg-pink-500", "bg-cyan-500",
  "bg-amber-500", "bg-indigo-500", "bg-rose-500", "bg-teal-500"
];

export function getGroupColor(groupId: string, customColor?: string): string {
  if (customColor) return customColor;
  // Hash-based selection ensures same group always gets same color
  const hash = hashString(groupId);
  return GROUP_COLOR_PALETTE[hash % GROUP_COLOR_PALETTE.length];
}
```

## Open Questions / Future Considerations
1. **Backend integration**: Current mock data - need API endpoints for CRUD operations
2. **Real-time updates**: Consider WebSocket for multi-user collaboration
3. **Service Agreement enforcement**: Add validation that SC has active agreement
4. **Requester field**: Add UI for capturing who requested the service call
5. **Bill To management**: Clarify business requirements for billing to different entity
6. **Task reordering**: Consider drag-and-drop within groups if users request
7. **Bulk task operations**: May need ability to move multiple tasks between groups
