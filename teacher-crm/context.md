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
- Slice 1 is Clients only.
- Schedule, Payments, Dashboard, and Analytics are future product areas, not part of the current implementation.
- Do not reserve empty UI sections for future functionality.
- Prefer simple, real-user utility over generic SaaS abstractions.
- Product architecture and build sequence are separate.
- The system will eventually use authenticated persistent storage because the data must survive sessions and devices.
