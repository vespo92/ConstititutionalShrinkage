# Executive Dashboard

A Next.js 14 frontend dashboard for regional pod administrators to implement policies, allocate resources, and track performance using Triple Bottom Line (TBL) metrics.

## Overview

The Executive Dashboard is part of the Constitutional Shrinkage project, providing executive/administrative functions for regional governance. It enables:

- **Policy Implementation Tracking** - Monitor and manage policy progress, milestones, and blockers
- **Resource Allocation** - Manage budgets, personnel, and infrastructure
- **TBL Metrics Dashboard** - Track People, Planet, and Profit performance indicators
- **Emergency Response** - Coordinate incidents and emergency responses
- **Performance Reporting** - Generate and export comprehensive reports

## Features

### Dashboard
- Key Performance Indicators (KPIs)
- Triple Bottom Line overview
- Recent activity feed
- Quick actions panel
- Emergency alerts

### Policy Management
- Create, view, and manage policies
- Implementation progress tracking
- Milestone management
- Resource allocation per policy
- Blocker tracking and resolution

### Resource Management
- Budget overview and allocation
- Personnel management
- Infrastructure tracking
- Resource utilization metrics

### Metrics & Analytics
- TBL Dashboard (People, Planet, Profit)
- Trend analysis and charts
- Regional comparisons
- Historical performance tracking

### Emergency Management
- Active incident monitoring
- Emergency response coordination
- Alert level management
- Resource mobilization

### Reports
- Generate TBL reports
- Policy progress reports
- Resource utilization reports
- Export to PDF/CSV

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS
- **State Management:** TanStack Query (React Query)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **Maps:** Leaflet (planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Project Structure

```
apps/executive/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard home
│   │   ├── policies/           # Policy management pages
│   │   ├── resources/          # Resource management pages
│   │   ├── metrics/            # Metrics and reports pages
│   │   ├── emergency/          # Emergency management pages
│   │   └── settings/           # Settings page
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── layout/             # Layout components
│   │   ├── shared/             # Shared components
│   │   ├── dashboard/          # Dashboard-specific components
│   │   ├── policies/           # Policy components
│   │   ├── metrics/            # Metrics components
│   │   └── emergency/          # Emergency components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities and API client
│   ├── types/                  # TypeScript type definitions
│   └── styles/                 # Global styles
├── public/                     # Static assets
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## API Integration

The dashboard integrates with the API Gateway (Agent_6) and Auth Service (Agent_7). Key endpoints:

- `/api/v1/policies` - Policy CRUD operations
- `/api/v1/metrics/tbl` - TBL metrics
- `/api/v1/resources` - Resource management
- `/api/v1/emergency` - Emergency incidents

## Design Guidelines

- Professional government-style design
- WCAG 2.1 AA accessibility compliance
- TBL Color scheme:
  - People: Green (#22c55e)
  - Planet: Blue (#3b82f6)
  - Profit: Gold/Orange (#f59e0b)
- Desktop-first responsive design

## Access Control

This application is restricted to users with:
- `administrator` role
- `executive` role

All actions are audit-logged for transparency.

## Development

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run development server with hot reload
npm run dev
```

## Conceptual Framework

### Distributed Executive Power
- Regional executive pods replacing centralized presidency
- Rotating coordination roles
- Emergency response coordination
- Interstate commerce mediation

### Reduced Federal Agencies
- Consolidation of overlapping agencies
- Regional execution of federal mandates
- Performance-based funding
- Automatic agency sunset provisions

### Transparency & Accountability
- Open-source policy execution
- Real-time budget tracking
- Public APIs for all executive data
- Citizen feedback loops

### Regional Autonomy
- Local execution of laws with regional variation
- Opt-in federal programs
- Competition between regional approaches
- Best practice sharing

## License

Part of the Constitutional Shrinkage open-source project.

---

*Agent_9 - Executive Application | Constitutional Shrinkage*
