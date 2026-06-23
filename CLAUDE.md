# LaundryKhalaas Prototype

Next.js 14 (App Router) laundry operations platform for the UAE. Pink/dark brand. All data is in-memory — no backend, no auth.

## Stack

- **Next.js 14** — App Router, all pages are client components (`'use client'`)
- **Tailwind CSS** + **shadcn/ui** (Radix primitives) for styling and components
- **Recharts** for charts, **React Hook Form** + **Zod** for forms
- **TypeScript** throughout

## File Map

```
app/
  layout.tsx            Root layout — wraps everything in <AppProvider> + <Toaster>
  page.tsx              Landing page → routes to /user/book or /admin

  admin/
    layout.tsx          Admin shell (sidebar nav)
    page.tsx            Dashboard (stats, recent orders)
    orders/page.tsx     Orders list + status filters
    orders/[id]/page.tsx  Order detail + status updater + driver assignment
    customers/page.tsx  Customer list
    drivers/page.tsx    Driver roster + live status
    facilities/page.tsx Laundry facility locations
    business/page.tsx   B2B client accounts
    memberships/page.tsx  Subscription plans
    reports/page.tsx    Revenue / ops charts
    approvals/page.tsx  Pending approval queue
    settings/page.tsx   Operator settings
    agent/page.tsx      Admin-side agent chat view
    ai-command/page.tsx AI command interface

  user/
    layout.tsx          User shell (bottom nav)
    page.tsx            User dashboard (active order card)
    book/page.tsx       Multi-step booking flow
    orders/page.tsx     Order history
    orders/[id]/page.tsx  Live order tracking
    services/page.tsx   Service catalogue
    memberships/page.tsx  Plan selection
    profile/page.tsx    User profile
    agent/page.tsx      User-side booking agent chat

components/
  admin/AdminLayout.tsx     Sidebar with nav links for admin routes
  user/UserLayout.tsx       Bottom-nav shell for user routes
  user/UserBottomNav.tsx    Mobile bottom navigation bar
  shared/StatusBadge.tsx    Order status pill (maps OrderStatus → color class)
  ui/                       shadcn/ui primitives (button, card, dialog, etc.)

lib/
  mock-data.ts    All static data + TypeScript types (Order, Driver, Customer,
                  BusinessClient, Service, AgentMessage). Single source of truth.
  app-context.tsx React context (AppProvider / useApp) — holds orders + drivers
                  in useState, exposes updateOrderStatus, assignDriver, addOrder.
  utils.ts        cn() helper (clsx + tailwind-merge)

hooks/
  use-toast.ts    Toast state hook (used by shadcn Toaster)
```

## Data Model (key types in `lib/mock-data.ts`)

| Type | Key fields |
|------|-----------|
| `Order` | id, status (`OrderStatus`), customerId, driverId, services[], items[], emirate, amount, isB2B |
| `Driver` | id, status (`available\|on_pickup\|on_delivery\|off_duty`), emirate, rating |
| `Customer` | id, status (`active\|vip\|inactive`), ordersCount, totalSpent |
| `BusinessClient` | id, contractStatus, weeklyVolume, outstandingInvoice, accountHealth |
| `Service` | id, type (`ServiceType`), startingPrice, turnaround, popular |
| `AgentMessage` | role (`user\|agent`), type (`text\|options\|order_summary\|driver_card`) |

`OrderStatus` pipeline: `pending → driver_assigned → pickup_in_progress → collected → cleaning → quality_check → out_for_delivery → delivered` (or `escalated`).

## State Management

`AppProvider` (wraps the entire app in `app/layout.tsx`) holds the mutable slice of mock data:

- `orders` — seeded from `ORDERS`, mutated by `updateOrderStatus` / `assignDriver` / `addOrder`
- `drivers` — read-only list from `DRIVERS`
- `activeOrderId` — currently focused order (defaults to `LK-AE-1024`)
- `newOrderCreated` — flag to trigger post-booking notifications

All pages consume state via `useApp()`. No external state library.

## Routing Conventions

- `/` — landing page
- `/admin/*` — operator views (AdminLayout sidebar)
- `/user/*` — customer-facing views (UserLayout bottom nav)
- Dynamic segments: `orders/[id]` exists in both admin and user trees
