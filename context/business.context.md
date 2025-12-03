Business process overview 

 

We are developing a multi-purpose software platform designed to provide our customers with comprehensive visibility into all their activities with us. Through this platform, customers will be able to: 

Track project progress: View the current status and updates of their ongoing projects. 

Manage service calls: Create new service requests, monitor existing ones, and see which technician or team member has been assigned. 

Access financial information: Review past invoices and payment history. 

Analyze performance metrics: Access detailed statistics such as open requests per location, average resolution time, total requests handled, and yearly summaries. 

This platform aims to centralize customer interactions, improve transparency, and streamline communication between our service team and clients. 

 

 

Business Process Overview 

Purpose 

This document defines Noxe’s internal business process model and system architecture. 
It describes the operational entities (Service Calls, Projects, Tasks, Service Agreements, and related components), their relationships, and workflow logic. 
This serves as a foundation for process automation, data modeling, and AI contextualization. 

 

1. Core Concept 

All operational activities—whether unplanned service work or structured projects—are ultimately tracked through Tasks, which form the atomic unit of work. 
Both Service Calls and Projects act as high-level containers for these Tasks, with differing creation flows, contractual conditions, and invoicing logic. 

 

2. Entities Overview 

Entity 

Description 

Creation Source 

Has Invoicing 

Requires Agreement 

Task Relationship 

Customer 

Legal or business entity served by Noxe 

Admin-defined 

N/A 

N/A 

Parent of Sites 

Site 

Physical or logical customer location 

Customer definition 

N/A 

Optional 

Parent for Service Calls 

Service Agreement 

Defines commercial, operational, and SLA terms 

Contractual setup 

Yes (defines rates) 

Yes 

Referenced by Service Calls 

Service Call 

Unplanned operational work (maintenance/configuration) 

Customer or Noxe-created 

Yes 

Mandatory 

Contains Tasks (manually created) 

Project 

Planned, structured initiative with defined deliverables 

Sales order + PO 

Yes 

No 

Contains Tasks (auto/grouped) 

Task 

Atomic operational unit (execution, tracking, costing) 

Created internally 

Indirect (via parent) 

N/A 

Shared across all activities 

Communication Thread 

Chat system for collaboration 

Auto-created per Service Call 

N/A 

N/A 

Internal + External 

Invoice 

Financial document for Service Calls / Projects 

Derived from operations 

Yes 

Depends on activity 

May reference Tasks 

 

3. Detailed Process Definitions 

3.1 Service Call 

Definition 

A Service Call represents unplanned maintenance or configuration work. 
Examples: replacing broken cables, configuring new cameras, or repairing server issues. 

Creation 

Can be initiated by a Customer or Noxe Employee. 

Requires an active Service Agreement (either site-specific or inherited from the customer level). 

Created via a structured form with the following fields: 

Title, Description, Priority 

Location (Site) 

Requester (Requerant) 

Issue Type / Equipment Type 

Attachments (e.g., pictures) 

Agreement Enforcement 

No Service Call can exist without an active Service Agreement. 

Agreement resolution order: 

Site Override Agreement (if active) 

Customer Default Agreement (if active) 

If neither exists → block Service Call creation 

Workflow 

Service Call created and linked to resolved Service Agreement. 

Internal and external communication threads are auto-generated. 

Noxe employees create Tasks to execute the work. 

Status transitions independently of Tasks: 

Open → In Progress → Resolved → Invoiced → Closed 

Notifications triggered on comments, status, or priority updates. 

Invoicing 

Invoicing occurs at the Service Call level. 

Each Invoice may contain: 

Time entries 

Material costs 

Travel expenses 

Task-linked or standalone charges 

Rates are based on the Service Agreement snapshot captured at creation. 

 

3.2 Projects 

Definition 

A Project is a structured, planned activity created from a Sales Order associated with a Purchase Order (PO). 
Projects usually involve multiple deliverables, defined scopes, and milestone-based billing. 

Structure 

Contains multiple Task Groups and Tasks. 
Example: 

Group: Development 

   Task: Setup Database 

   Task: Develop Web UI 

Workflow 

Created after sales confirmation and PO reception. 

Tasks defined and grouped based on phases or deliverables. 

Tasks assigned and tracked independently. 

Invoicing is typically percentage-based (progress billing). 

Billing and Rates 

Project-level rates define sales price per man-hour type. 

Company-wide standard costs define the cost basis. 

Projects can include fixed-price, T&M, or milestone-based models. 

 

3.3 Service Agreement 

Definition 

A Service Agreement (SA) defines rates, contractual terms, and service levels for all Service Calls under its scope. 

Structure 

Two levels: 

Customer Default Agreement: Global fallback for all Sites. 

Site Override Agreement: Site-specific, which overrides the customer default. 

A Customer may have multiple agreements (one per Site + optional global default). 

Contents 

Effective Period (Start / End Date) 

Rate Cards (labor, materials, travel) 

Payment Terms 

SLA definitions (response/resolution times) 

Rules 

Only one active agreement per Site (and optionally one global default per Customer). 

A Service Call must reference an active agreement at creation. 

Agreement snapshots are stored on the Service Call to preserve historical accuracy. 

 

3.4 Task 

Definition 

A Task is the fundamental operational entity. 
It encapsulates the execution of a specific action within a Service Call or Project. 

Attributes 

Title, Description, Status 

Assigned Employees  

Time Entries 

Material Usage (used / ordered / estimated) 

Transport and Cost Records 

Parent Reference (Service Call or Project) 

Purpose 

Tasks unify: 

Work execution tracking 

Resource allocation 

Costing and invoicing integration 

Analytics and KPI computation 

Behavior 

Created manually by Noxe for Service Calls 

Can be grouped 

Can exist without direct invoicing but always traceable to a parent activity 

 

3.5 Communication Threads 

Each Service Call automatically spawns two chat threads: 

Type 

Participants 

Purpose 

External Thread 

Noxe + Customer 

Collaboration, updates, issue resolution 

Internal Thread 

Noxe only 

Internal coordination and task management 

Threads are event-driven with notifications on new comments, file uploads, or status changes. 

 

3.6 Invoicing 

Definition 

Invoices represent financial documentation of completed or billable work under Service Calls or Projects. 

Structure 

Each Service Call may have one or multiple Invoices. 

Each Invoice contains Invoice Lines, which may link to specific Tasks. 

Line Types include: Labor, Materials, Travel, Adjustments. 

Rules 

Invoices are derived from the agreement snapshot stored on the Service Call. 

Historical rate integrity is preserved by using snapshot values. 

Invoicing status transitions: 

Draft → Sent → Paid → Closed 