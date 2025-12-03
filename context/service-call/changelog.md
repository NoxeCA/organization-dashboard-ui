# Service Call Domain - Changelog

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
