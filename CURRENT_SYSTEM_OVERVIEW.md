# Current System Overview: Activity & Assignment Management

This document provides a technical overview of how Activities, Orders, and Assignments are currently implemented in the ERP system as of March 2026.

## 1. Data Architecture

### Core Models
- **`CustomerActivity`**: 
    - Acts as both a **Template** (when `orderId` is null) and an **Instance** (when `orderId` is set).
    - When an Order is created, the system "clones" the customer's activity definitions into order-specific instances.
    - Fields: `name`, `type`, `code`, `unit`, `quantity`, `unitPrice`, `lineTotal`.
- **`OrderQualification` (Dual Structure)**:
    - Currently used for **Exports** and **Revenue Calculation**.
    - Acts as a snapshot of an activity's pricing at the moment the order was placed.
    - It is linked to the `CustomerActivity` instance.
- **`Assignment`**:
    - Represents the link between an `Employee`, an `Order`, and optionally a specific `CustomerActivity`.
    - Fields: `status` (ASSIGNED, ACTIVE, COMPLETED, etc.), `startDate`, `endDate`, `estimatedHours`, `actualHours`.
- **`Order`**:
    - The top-level container.
    - Statuses: `DRAFT`, `OPEN`, `ACTIVE`, `IN_PROGRESS`, `IN_REVIEW`, `COMPLETED`, `CANCELLED`, `EXPIRED`.

### Hidden Logic & Fallbacks
- **Fallback Pricing**: 
    - The `priceService` used by Admins defaults to **25.00 EUR** if no tier is found.
    - The `teamLeaderService` used for container calculation defaults to **0.00 EUR** if no tier is found.
- **Status Mapping**:
    - Internal `DRAFT`/`OPEN` → Customer sees **"planned"**.
    - Internal `ACTIVE`/`IN_PROGRESS`/`IN_REVIEW` → Customer sees **"inprogress"**.
- **Auto-Sync**: The system already has logic to flip an Order to `IN_PROGRESS` if any Assignment becomes `ACTIVE`.

## 2. Current Workflows (Pre-Milestone 1)

### Admin Operations
- **Creation**: Admins create orders and select "Activities". Behind the scenes, the system calculates pricing by aggregating tiered rates from the `priceService`.
- **Assignment**: Admins assign employees. Assignments currently default to the order's scheduled start/end times.
- **Execution**: There is a global "Start Work" button in the Admin UI which flips the order to `IN_PROGRESS` but **does not** yet handle individual employee clock-ins.

### Team Leader Operations
- **Dashboard**: Team Leaders have a specialized view (`teamLeaderService.ts`) that aggregates orders for their entire team (all members).
- **Price Calculation**: They have access to `calculateContainerPrices`, which clones the pricing tier logic for on-the-spot calculations.

### Employee Operations
- **Container Workflow**: Workers currently have a specialized screen for **Containers**.
    - They "Start" a container, which assigns them to it.
    - They "Report" quantities (cartons/articles) to complete it.
- **Activity Workflow**: The generic "Activity" tracking is visible but lacks the refined "Team Start" interaction required for Milestone 1.

## 3. Milestone 1 Focus: Activity Structure & Team Workflow

The goal is to move from "All-or-Nothing" order starting to **Specific Employee Check-ins**.

### Specific Goals:
1. **The "Recorder" Role**: Any assigned employee can open the "Team Start" modal to check in themselves and their present colleagues.
2. **The "Late-Comer" Button**: A simple "Start" button next to any employee who is assigned but not yet working.
3. **Audit Trail**: Recording the `startedById` (who clicked the button) and `startDate` (actual click time) into the `Assignment` record.

### Strict Boundaries:
- **No Pricing**: Logic for EUR/Hour or Piece-based pay is **EXCLUDED**.
- **No Multi-location**: Managed in Milestone 4.
- **Single Activity focus**: Milestone 3 will handle multiple tasks.

## 4. Conclusion
The foundation is very strong. The "Container" logic provides a great blueprint for how we should implement the "Activity" logic. Milestone 1 will effectively "generalize" the worker check-in process so it works for all activity types, not just containers.
