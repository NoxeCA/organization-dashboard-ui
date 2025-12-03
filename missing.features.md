--
  Functional Analysis: Service Call & Task Feature

  Current Implementation Summary

  What's Been Implemented:

  | Feature                  | Status     | Notes                                                                     |
  |--------------------------|------------|---------------------------------------------------------------------------|
  | Service Call List        | ✅ Complete | Table/Card views, search, status/priority filters                         |
  | Service Call Creation    | ✅ Complete | Dialog with customer, site, priority, issue/equipment type                |
  | Service Call Detail View | ✅ Complete | Status, details, customer/site info, dates                                |
  | Task Kanban Board        | ✅ Complete | Drag-drop between Backlog/Todo/In Progress/Done                           |
  | Task List View           | ✅ Complete | Grouped by status                                                         |
  | Task Creation            | ✅ Complete | Name, description, status, site, assignees, planned time, due date        |
  | Task Detail Sheet        | ✅ Complete | View/edit details, time entries, materials                                |
  | Time Entry Management    | ✅ Complete | Add/remove time entries with employee, hours, date, description           |
  | Material Management      | ✅ Complete | Add/remove materials with qty, unit cost, status (estimated/ordered/used) |
  | Communication Threads    | ✅ Complete | Internal + External threads with messages                                 |
  | Financial Summary        | ✅ Complete | Estimated/Real cost and sell price display                                |
  | Status Workflow          | ✅ Partial  | Can change status via dropdown, but no validation rules                   |

  ---
  Missing Features for a Full ERP Service Call/Task Module

  Based on the business context and typical ERP functionality, here are the critical gaps:

  ---
  1. Service Agreement Integration (Critical - per business.context.md)

  Per the business document: "No Service Call can exist without an active Service Agreement"

  Missing:
  - Service Agreement entity and types
  - Agreement resolution logic (Site Override → Customer Default → Block)
  - Agreement snapshot stored on Service Call creation
  - Rate cards (labor, materials, travel rates)
  - SLA definitions (response/resolution times)
  - Payment terms

  Impact: Cannot enforce contractual terms or calculate correct billing rates.

  ---
  2. Invoicing System (Critical)

  Per the business document: "Invoicing occurs at the Service Call level"

  Missing:
  - Invoice entity with status (Draft → Sent → Paid → Closed)
  - Invoice lines linked to Tasks (Labor, Materials, Travel, Adjustments)
  - Generate invoice from Service Call
  - Invoice preview/PDF export
  - Rate application from agreement snapshot
  - Billable vs non-billable time entry distinction (field exists but not enforced)

  ---
  3. Travel/Transport Tracking (Important)

  Per the business document: "Transport and Cost Records" on Tasks

  Missing:
  - Travel entry type (distance, vehicle, travel time)
  - Travel cost calculation
  - Travel expenses on invoices

  ---
  4. Task Priority (Important)

  Missing:
  - Task-level priority (currently only Service Call has priority)
  - Priority badge on task cards
  - Sort/filter by task priority

  ---
  5. Requester/Contact Management (Important)

  Per the business document: "Requester (Requerant)" field

  Missing:
  - Requester selection (Customer contact vs Employee)
  - Contact information display
  - Requester notification preferences

  ---
  6. Attachments/Files (Important)

  Missing:
  - File upload on Service Call creation
  - File attachments on Tasks
  - Attachment viewing in threads (UI exists but not functional)
  - Image/document preview

  ---
  7. SLA Tracking & Alerts (Important)

  Missing:
  - Response time tracking (first response to customer)
  - Resolution time tracking
  - SLA breach warnings/alerts
  - Overdue task indicators
  - Dashboard SLA metrics

  ---
  8. Service Call Edit Functionality (Important)

  Missing:
  - Edit button on detail page is non-functional
  - Edit dialog for Service Call (similar to create dialog)
  - Field update history/audit log

  ---
  9. Notifications (Important)

  Per business document: "Notifications triggered on comments, status, or priority updates"

  Missing:
  - Notification system for status changes
  - Email notifications
  - In-app notification center
  - @mentions in threads

  ---
  10. Task Groups (Medium)

  Per the business document and types: "taskGroups?: TaskGroup[]"

  Missing:
  - Task group creation UI
  - Group tasks visually (collapsible sections)
  - Group-level progress tracking

  ---
  11. Advanced Filtering & Search (Medium)

  Missing:
  - Date range filter
  - Assignee filter
  - Customer filter
  - Site filter
  - Saved filters/views
  - Sorting options (by date, priority, etc.)

  ---
  12. Bulk Operations (Medium)

  Missing:
  - Select multiple service calls
  - Bulk status change
  - Bulk assignment
  - Export to CSV/Excel

  ---
  13. Activity/History Log (Medium)

  Missing:
  - Status change history
  - Who changed what and when
  - Audit trail for compliance

  ---
  14. Reporting & Analytics (Medium)

  Per business document: "Analytics and KPI computation"

  Missing:
  - Average resolution time
  - Open requests per location
  - Total requests handled
  - Yearly summaries
  - Technician workload reports
  - Material usage reports

  ---
  15. Scheduling/Calendar View (Nice to Have)

  Missing:
  - Calendar view of tasks by due date
  - Technician schedule view
  - Dispatch board

  ---
  Priority Implementation Roadmap

  | Priority | Feature                       | Effort |
  |----------|-------------------------------|--------|
  | P0       | Service Agreement Integration | High   |
  | P0       | Invoice Generation            | High   |
  | P1       | Service Call Edit             | Low    |
  | P1       | Attachments/File Upload       | Medium |
  | P1       | Travel/Transport Tracking     | Medium |
  | P1       | Task Priority                 | Low    |
  | P2       | SLA Tracking                  | Medium |
  | P2       | Notifications                 | Medium |
  | P2       | Activity History              | Medium |
  | P2       | Task Groups UI                | Low    |
  | P3       | Advanced Filtering            | Medium |
  | P3       | Bulk Operations               | Medium |
  | P3       | Reporting Dashboard           | High   |
  | P3       | Calendar/Scheduling           | High   |

  ---
  Recommended Next Steps

  1. Implement Service Agreement - This is the foundation for proper billing and SLA enforcement
  2. Add Invoice Generation - Complete the billing workflow
  3. Make Edit functional - Critical for daily operations
  4. Add Task Priority - Quick win for better task management
  5. Implement Attachments - Essential for service documentation

  Would you like me to start implementing any of these missing features?