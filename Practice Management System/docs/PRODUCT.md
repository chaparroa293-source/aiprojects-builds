# Product

This document is the compact Product Definition Gate for Practice Management System. The canonical grammar for implemented objects and operations is [TECHNICAL_SPEC.md](../TECHNICAL_SPEC.md); physical storage is described in [DATABASE.md](DATABASE.md); delivery evidence belongs in [BUILD_LOG.md](BUILD_LOG.md).

## User, problem, and purpose

Practice Management System is for independent, session-based professionals, initially tutors, psychologists, psychopedagogy professionals, and similar individual practitioners. It is Spanish-first, Paraguay-oriented, and starts with one practitioner working in a private workspace.

Running a practice creates administrative and mental overhead: important client, schedule, session, and payment information must be captured, organized, and found again. The product is the practitioner's operational workspace and memory. Its conceptual operating loop is:

**Capture → Organize → Schedule → Communicate → Operate → Remember → Understand**

This is not primarily a CRM. It is a focused practice-management product that should make operational information easy to record, retrieve, and understand without requiring administrative expertise.

## Product principles

- Keep important operational truth in persisted domain records, with a defined retrieval path.
- Minimize navigation and required input when recording what happened.
- Keep Appointment, Session, and Payment meanings distinct.
- Derive understanding only from data the system actually stores; do not imply unsupported balances, debt, revenue, or other accounting truth.
- Start with a single practitioner and avoid speculative domain flexibility, automation, or multi-tenant architecture.
- Treat profession-specific behavior as evidence-led adaptation of a shared core, not as assumed configuration.

## Current product

The implemented core contains four persisted objects: Client, Appointment, Session, and Payment.

- **People:** Client Directory and Client Detail.
- **Work:** client-owned Appointments for planned work and Sessions for actual session history.
- **Money:** client-owned Payments recording money actually received. A Session may reference one same-client Payment, and one Payment may be referenced by many Sessions.
- **Schedule:** a Monday–Sunday weekly Calendar across clients plus each Client's Agenda, both reading and writing the same Appointments.
- **Capture:** persistent Quick Capture entry for creating an ordinary Session or Payment. Quick Capture is an interaction pattern, not a stored object.
- **Memory:** client-scoped retrieval through Datos, Agenda, Sesiones, and Pagos.
- **Understanding:** currently limited to the client-scoped `Total recibido` sum and derived Payment-linked Session count/detail.

The latest completed slice is **PMS-CAL-002 Calendar v1**. Day/month modes, recurrence, drag-and-drop, conflict/availability behavior, Google Calendar integration, global Sessions, global Payments, generalized contacts, communications, follow-ups, general analytics, authentication, deployment, and PWA behavior are not implemented.

## Important current semantics

- An Appointment is planned work; it is not a Session, and conversion is not implemented.
- A Session is an operational history record. Its optional Payment reference records an association only.
- A Payment is money received. It is not an invoice, amount owed, balance, debt, session price, reconciliation, or earned revenue.
- Payment association has no allocation amount and does not replace Session status.
- Quick Capture writes the same Session and Payment objects as their contextual forms and creates no separate history or duplicate storage.

## Approved direction, not yet designed

- **People:** broaden the Directory to other contacts relevant to the practice. No Contact object is approved yet.
- **Schedule:** evolve the implemented weekly Calendar only through approved slices. Google Calendar remains an integration candidate, separate from the local Calendar.
- **Communication:** help practitioners organize work-related communication, progressing conceptually from **Save → Send → Schedule → Automate**. Possible capabilities include saved email drafts, reusable communications, manual sending, scheduled sending, and later bounded automation.
- **Capture:** continue treating quick capture as a cross-system interaction pattern over real domain objects.
- **Memory:** make accumulated practice activity easier to retrieve and understand without inventing a global History object.
- **Understanding:** make analytics a core product layer derived from accumulated operational data; KPI definitions have not been approved.
- **Follow-up:** support follow-up work after its semantics and ownership are designed.
- **Notes:** support useful note-taking where validated; an independent Note object is not approved.

## Important scenarios

- Create a Client, retrieve it from the Directory, edit it, and recover persisted values after reload.
- Within a Client, plan an Appointment separately from recording an actual Session.
- Record money received without implying accounting or debt state.
- Link, change, or unlink a same-client Payment from a Session while preserving both records and the narrow association meaning.
- Capture a Session or Payment quickly, then retrieve it through the owning Client's normal history.
- Use the current product only with non-sensitive development data until authentication, ownership, and production access control exist.
- In future calendar or communication work, preserve clear user control and do not infer synchronization, sending, scheduling, or automation behavior before it is designed.

## Out of scope for the current product model

Do not redefine the product as accounting or invoicing software, an ERP, a general-purpose CRM, enterprise practice-management software, a team collaboration suite, a workflow automation platform, or a speculative multi-tenant SaaS architecture.

The current model does not include invoices, debt, balances, reconciliation, session pricing, earned revenue, global History, generalized Contact, Communication, Email, Message, Template, Automation, FollowUp, or independent Note objects.

## Known unknowns and unresolved decisions

- Broader Contact/Directory domain model and which non-client people belong in it.
- Calendar evolution beyond the implemented weekly mode, including whether day or month modes are needed.
- Google Calendar integration and synchronization semantics, directionality, conflicts, ownership, and failure recovery.
- Communication/email domain model and retrieval model.
- Email provider and sending architecture.
- Rules, permissions, failure behavior, and audit needs for scheduled or automated communication.
- FollowUp semantics, relationships, lifecycle, and retrieval.
- Whether Notes remain fields/contextual records or become an independent object.
- Analytics questions, KPI definitions, source/filter/operation/meaning contracts, and presentation.
- Record deletion: whether Client / Appointment / Session / Payment support hard delete or rely on existing state transitions (`inactivo`, `cancelada`); related-record consequences; and the DB grant/RLS changes it would require. Deletion is currently unsupported for every object (see `TECHNICAL_SPEC.md` DEFERRED → Deletion).
- Authentication, practitioner identity, workspace ownership, and authorization model.
- Production RLS and access-control policy.
- Multi-customer hosting and isolation architecture.
- Deployment provider, environments, domain, and operational strategy.
- PWA, offline, installation, and synchronization strategy.
- Validated profession-specific differences for tutors, psychologists, psychopedagogy professionals, and other practitioners.

## Gate status

**PASS.** This document separates implemented reality, approved direction, explicit exclusions, important scenarios, and unresolved design. Future direction does not authorize a domain model or implementation until it passes deliberate product definition and slice approval.
