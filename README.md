<div align="center">

# Human Resource Management System (HRMS)

### Every workday, perfectly aligned.

A unified platform to digitize core HR operations — onboarding, attendance, leave, and payroll visibility — built for speed, clarity, and role-based control.

</div>

## Overview

**HRMS** is a role-based Human Resource Management System designed to replace scattered spreadsheets and manual approval chains with a single, secure, digital workflow. It covers the full employee lifecycle touchpoint set that most small-to-mid-sized teams actually need day-to-day: authentication, profile management, attendance tracking, leave requests, approvals, and payroll visibility — without the bloat of enterprise HR suites.

## Problem Statement

Most small and growing organizations still manage HR operations through a patchwork of spreadsheets, email threads, and verbal approvals. This leads to:

- No single source of truth for employee data
- Manual, error-prone attendance and leave tracking
- Delayed or untracked approval workflows
- Zero self-service visibility for employees into their own records
- Payroll data that is hard to audit or update safely

## Our Solution

HRMS consolidates these scattered processes into one role-aware application with two clear personas — **Admin/HR Officer** and **Employee** — each seeing only what they need. Every action (leave applied, attendance marked, approval given) reflects instantly across the system, removing the lag and ambiguity of manual processes.

## Key Features

### Authentication & Authorization
- Secure sign-up with Employee ID, email, password, and role selection (Employee / HR)
- Enforced password strength rules and mandatory email verification
- Sign-in with clear error handling on invalid credentials
- Role-based redirection to the appropriate dashboard

### Dashboards
- **Employee Dashboard:** quick-access cards for Profile, Attendance, Leave Requests, and Logout, plus recent activity and alerts
- **Admin/HR Dashboard:** full employee list, attendance records, leave approvals, and the ability to switch between employee views

### Employee Profile Management
- View personal details, job details, salary structure, documents, and profile picture
- Employees can edit limited fields (address, phone, profile picture)
- Admins can edit all employee details

### Attendance Management
- Daily and weekly attendance views
- Employee check-in / check-out
- Status tracking: Present, Absent, Half-day, Leave
- Employees view only their own records; Admin/HR views all records

### Leave & Time-Off Management
- Apply for Paid, Sick, or Unpaid leave via a calendar-based date range picker
- Add remarks; view a monthly calendar with Present/Absent markers
- Status tracking: Pending, Approved, Rejected
- Admin/HR can view, approve, reject, and comment on requests, with changes reflected instantly

### Payroll / Salary Management
- Read-only payroll view for employees
- Admin can view all payroll data, update salary structures, and maintain payroll accuracy

## User Roles

| User Type | Description |
|---|---|
| **Admin / HR Officer** | Manages employees, approves leave and attendance, views and edits payroll details |
| **Employee** | Views personal profile, tracks attendance, applies for leave, views salary details |

## System Architecture

The system follows a role-based access control (RBAC) model, separating Admin/HR and Employee flows at both the UI and permissions layer.

> Wireframes and flow diagrams: [View on Excalidraw](https://link.excalidraw.com/l/65VNwvy7c4X/58RLEJ4oOwh)

```
┌─────────────────┐        ┌──────────────────┐        ┌─────────────────┐
│   Client (Web)   │◄─────► │   API / Backend   │◄─────► │    Database      │
│  React / Vue UI  │        │  Auth, RBAC,      │        │  Employees,      │
│  Role-based views│        │  Business Logic   │        │  Attendance,     │
└─────────────────┘        └──────────────────┘        │  Leave, Payroll  │
                                                          └─────────────────┘
```

## Tech Stack

> Update this table with the stack actually used in your submission — the layout below is a suggested starting point for a project of this scope.

| Layer | Suggested Technology |
|---|---|
| Frontend | React.js / Tailwind CSS |
| Backend | Node.js + Express (or Flask) |
| Database | MongoDB / PostgreSQL |
| Authentication | JWT + bcrypt |
| Calendar / Attendance UI | FullCalendar.js |
| Deployment | Vercel / Render / Railway |
| Version Control | Git & GitHub |

## SWOT Analysis

| Strengths | Weaknesses |
|---|---|
| Covers the full core HR loop (auth, profile, attendance, leave, payroll) in one system | Currently single-tenant; not yet built for multi-organization use |
| Clear role-based separation reduces complexity and access risk | No native mobile app at this stage |
| Calendar-based leave application improves usability over form-only flows | Payroll is visibility-only, not a full payroll processing engine |
| Lightweight scope makes it fast to deploy and demo | Limited third-party integrations (no biometric devices, no external payroll gateways yet) |

| Opportunities | Threats |
|---|---|
| Expand into a multi-tenant SaaS product for multiple organizations | Established players (Zoho People, BambooHR, Keka) dominate the market |
| Add biometric or geo-fenced attendance for hybrid/field teams | Data privacy and compliance requirements (e.g., labor law, data protection) increase with scale |
| Introduce AI-driven analytics (attrition prediction, leave pattern insights) | Employee trust depends heavily on data security guarantees |
| Integrate with payroll gateways and accounting tools (Tally, QuickBooks) | User adoption resistance if migration from spreadsheets isn't well-supported |

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- A running instance of your chosen database (MongoDB/PostgreSQL)

### Installation

```bash
# Clone the repository
git clone https://github.com/Soumalya-1/human-resource-management-system.git
cd hrms

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run the development server
npm run dev
```

### Environment Variables

```
DATABASE_URL=
JWT_SECRET=
EMAIL_SERVICE_API_KEY=
PORT=5000
```

## Project Structure

```
hrms/
├── client/                 # Frontend application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
├── server/                 # Backend API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── middleware/
├── docs/                   # SRS, diagrams, wireframes
├── .env.example
└── README.md
```

## Roadmap

- [ ] Mobile-responsive PWA support
- [ ] Biometric/geo-fenced attendance integration
- [ ] Automated payroll processing with payslip generation
- [ ] AI-based leave pattern and attrition analytics
- [ ] Multi-tenant support for multiple organizations
- [ ] Notification system (email/push) for approvals and alerts

## Why This Project Stands Out

- **Complete lifecycle coverage:** most hackathon HR tools solve one slice (attendance-only, leave-only); this covers auth through payroll visibility in a single coherent system.
- **Real RBAC, not a toggle:** Admin and Employee are genuinely separate experiences, not the same screen with hidden buttons.
- **Grounded in a written SRS:** every feature traces back to a documented functional requirement, not an improvised feature list.
- **Immediate real-world applicability:** solves a problem every small organization actually has, with a clear path to a monetizable SaaS product.


## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

<div align="center">

**If this project helped or inspired you, consider giving it a star.**

</div>
