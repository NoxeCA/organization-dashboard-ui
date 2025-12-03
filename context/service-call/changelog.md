# Service Call Domain - Changelog

## Iteration 2 - 2025-12-03

### Added
- `TaskCard` component for reusable, improved task card design with context menu
- `TaskCardView` component for card-based view grouped by status
- `TaskTableView` component for table-based view
- Group filter dropdown to filter tasks by specific group or show all
- Context menu (right-click) for quick task status changes on cards
- Click-to-change status dropdown in table rows
- Group badges on task cards showing which group a task belongs to
- Visual progress indicators on task cards

### Changed
- **Replaced Kanban with simpler card-based status grouping** - cards grouped by status (Backlog, To Do, In Progress, Done)
- **Table view** with columns: Task, Group, Status, Assignees, Due Date, Hours, Materials
- Task cards now show group name as colored badge
- Improved task card visual hierarchy (name, description, metadata clearly separated)
- Simplified detail page state management (removed Kanban column tracking)
- View toggle now switches between "Cards" and "Table" views
- Status can be changed via context menu (cards) or inline dropdown (table)

### Removed
- `TaskGroupSection` component (replaced by simpler approach)
- Kanban board and drag-and-drop functionality
- Collapsible group sections (groups now shown as badges/filters)
- kibo-ui Kanban dependency from detail page

### Decisions
- Card-based status grouping is simpler than Kanban and sufficient for task management
- Table view better for scanning many tasks quickly (sortable columns in future)
- Group filter provides focus without fragmenting the view
- Context menu on cards provides faster workflow for common status changes
- Kept TaskGroupDialog for creating/editing groups (groups still exist, just displayed differently)

---

## Iteration 1 - 2025-12-03

### Added
- `TaskGroupDialog` component for creating and editing task groups
- `TaskGroupSection` component with collapsible sections and embedded Kanban boards
- Task group selector in `TaskDialog` for assigning tasks to groups on creation
- Task group display and editing in `TaskDetailSheet`
- Mock data for task groups in service calls sc-1 and sc-2
- Installed shadcn `collapsible` component

### Changed
- Updated `app/service-call/[id]/page.tsx` to organize tasks by groups in both Kanban and List views
- Modified `TaskDialog` to accept `taskGroups` prop and `onTaskCreate` signature includes optional groupId
- Enhanced `TaskDetailSheet` with `taskGroups` and `onGroupChange` props
- Task list view now shows tasks organized by their groups with visual separation

### Removed
- N/A (initial iteration)

### Decisions
- Chose collapsible sections layout for Kanban (each group has its own complete Kanban board)
- Support both drag-and-drop and edit dialog methods for moving tasks between groups
- Task groups are displayed above ungrouped tasks section
- Ungrouped tasks section is shown by default when no groups exist
- Deferred Service Agreement enforcement to future iteration
- Deferred Bill To management to future iteration
- Deferred task-level internal threads to future iteration

---
