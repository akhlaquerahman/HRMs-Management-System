# 08 - Enterprise UI Architecture

## Design System Overview

This application leverages **Tailwind CSS v4** for utility-first styling and **Shadcn UI** for accessible, customizable, and high-quality React components. 

### Core Components

- **Layouts**: 
  - Uses a persistent shell containing a Sidebar and a Top Navbar.
  - The main content area is responsive, taking up the remaining space.
  
- **Sidebar**:
  - Collapsible (icon-only mode vs full mode).
  - Navigation links change dynamically based on the user's RBAC role.
  - Contains grouped sections (e.g., Personal, Management, System).

- **Navbar**:
  - Contains global search.
  - User profile dropdown menu (Profile, Settings, Logout).
  - Notification bell with an unread badge and dropdown list.

- **Breadcrumbs**:
  - Placed below the Navbar.
  - Automatically generated based on the current Next.js route, providing clear orientation (e.g., Home > HR Management > Employee Directory).

- **Data Tables**:
  - Built using `@tanstack/react-table` combined with Shadcn UI.
  - Features: Server-side pagination, global/column filtering, sorting, and row selection.
  - Action menus (three dots icon) at the end of rows for Edit/Delete actions.

- **Forms**:
  - Managed by `react-hook-form` and validated via `zod`.
  - Uses Shadcn UI's Form wrapper to display inline error messages seamlessly.
  - Complex forms are divided into Stepper wizards (e.g., Onboarding a new employee).

- **Cards**:
  - Used heavily in dashboards to display metrics (e.g., Total Employees, Leaves Pending).
  - Contains a title, a large metric value, and a sparkline or percentage change indicator.

- **Modals / Dialogs**:
  - Used for disruptive actions that require focus (e.g., "Are you sure you want to reject this leave?").
  - Includes a semi-transparent backdrop blur.

- **Notifications / Toasts**:
  - Uses Shadcn's `use-toast` hook.
  - Appears in the bottom-right corner for success, error, or informational alerts (e.g., "Attendance marked successfully").

## Visual Aesthetics
- **Color Palette**: Professional corporate scheme. Primary blue (`blue-600`), neutral grays for backgrounds, and semantic colors (green for approved, yellow for pending, red for rejected/error).
- **Typography**: `Inter` font for clean, highly legible data presentation.
- **Dark Mode**: Fully supported via Tailwind's `dark:` classes and `next-themes`.
