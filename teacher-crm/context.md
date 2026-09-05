# Teacher CRM

## Product context

- **Product:** tablet-first web app for a private tutor running one-on-one after-school classes.
- **Primary user:** one real tutor.
- **Purpose:** replace scattered notes and memory with one operational tool.

## Product areas

- Clients
- Schedule
- Payments
- Dashboard
- Analytics

## Build principles

- Build progressively, one coherent slice at a time.
- Clients Slice 1 is complete; Schedule Slice 1 is the current build step.
- Payments, Dashboard, and Analytics are future product areas, not part of the current implementation.
- Do not reserve empty UI sections for future functionality.
- Prefer simple, real-user utility over generic SaaS abstractions.
- Product architecture and build sequence are separate.
- The system will eventually use authenticated persistent storage because the data must survive sessions and devices.

## Product principle — business guidance through normal use

The tutor is an experienced teacher, but the application should not assume that she thinks or operates in formal business-management terms.

The product should capture information through familiar operational activities — students, classes, schedules, and payments — and organize that information into useful business understanding automatically.

The tutor should not need to manually maintain business abstractions, KPIs, CRM concepts, or reports when those can be derived from normal operational data.

As the product develops:

- Clients represent the tutoring relationships.
- Schedule / Classes represent teaching activity and workload.
- Payments represent money received and still to be received.
- Dashboard should summarize what needs attention and how the business is doing now.
- Analytics should derive useful patterns and trends from operational history.

Prefer plain operational language over unnecessary business jargon in the UI.

General principle:

**The tutor records operational reality; the application turns it into business understanding.**

This principle does not add Dashboard, Analytics, Payments, KPI logic, or future business reporting to the current slice.
