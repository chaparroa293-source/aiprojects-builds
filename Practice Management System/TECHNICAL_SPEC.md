# Technical Specification

Canonical logical contract for the implemented Practice Management System. Product scope is in `docs/PRODUCT.md`; physical storage is in `docs/DATABASE.md`; visual and interaction behavior is in `DESIGN.md`; verification evidence is in `docs/BUILD_LOG.md`.

## SYSTEM

```text
PRODUCT: Practice Management System
STATUS: Development
LOCALE: es-PY
CURRENCY: PYG / ₲
FRONTEND: React + Vite
DATA PLATFORM: Supabase
DATABASE: PostgreSQL
SCHEMA: practice_management
HOSTING: Cloudflare — preferred/planned, not implemented
AUTH: Deferred
PWA: Planned, not implemented
```

## OBJECT REGISTRY

| Object | Type | Status | Parent |
| --- | --- | --- | --- |
| Client | Entity | Built | — |
| Session | Event | Built | Client |
| Payment | Transaction | Planned | TBD |
| FollowUp | Event | Planned | TBD |
| Note | Record | Planned | TBD |
| Appointment | Event | Deferred | TBD |

## OBJECT SPECIFICATIONS

### Client

```text
TYPE: Entity
PERSISTENCE: practice_management.clients
id: uuid, generated primary key
nombre: text, required, trimmed value must be non-empty
apellido: text, required, trimmed value must be non-empty
telefono: text, optional
email: text, optional
notas: text, optional
estado: text, required, default activo; activo | inactivo
created_at: timestamptz, generated on create
updated_at: timestamptz, generated on create and refreshed on update
```

### Session

```text
TYPE: Event
PERSISTENCE: practice_management.sessions
id: uuid, generated primary key
client_id: uuid, required foreign key
fecha: date, required
hora_inicio: time, required
duracion_minutos: integer, optional/nullable; when supplied, > 0
estado: text, required; programada | completada | cancelada
notas: text, optional
created_at: timestamptz, generated on create
updated_at: timestamptz, generated on create and refreshed on update
```

## RELATIONSHIPS

```text
REL-001
FROM: Client
TO: Session
CARDINALITY: 1:N
FK: sessions.client_id → clients.id
REQUIRED: yes
REASSIGNMENT: unsupported
```

## RULES / INVARIANTS

```text
RULE-001: Client.nombre is required and cannot be blank after trimming.
RULE-002: Client.apellido is required and cannot be blank after trimming.
RULE-003: Client.estado is activo or inactivo; its database default is activo.
RULE-004: Session.client_id must reference an existing Client.
RULE-005: Session.fecha and Session.hora_inicio are required.
RULE-006: Session.duracion_minutos may be null; when supplied it is a positive integer.
RULE-007: Session.estado is programada, completada, or cancelada.
RULE-008: Session client reassignment is unsupported.
RULE-009: Session is neither a scheduling object nor a payment object.
RULE-010: Important operational state must not exist only in frontend state.
RULE-011: Every persisted operational object must have a defined retrieval path.
```

## OPERATIONS

| Object | Create | Read | Update | Delete | Search | Filter | Sort | List by parent |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Client | Implemented | Directory/detail | Implemented | Unsupported | Name, email, phone | estado | Recent or name | — |
| Session | Implemented | Client history/detail-edit | Implemented | Unsupported | Unsupported | Unsupported | fecha desc, hora_inicio desc | Implemented |

## CAPTURE CONTRACTS

### Create Client

```text
CONTEXT: Client Directory
USER_REQUIRED: nombre, apellido
USER_OPTIONAL: telefono, email, notas, estado
DEFAULTS: estado=activo
SYSTEM_GENERATED: id, created_at, updated_at
OUTPUT: Client
PERSISTENCE_TARGET: practice_management.clients
```

### Create Session

```text
CONTEXT: Client Detail → Sesiones
USER_REQUIRED: fecha, hora_inicio, estado
USER_OPTIONAL: duracion_minutos, notas
DEFAULTS: form estado=programada (database has no estado default)
SYSTEM_GENERATED: id, created_at, updated_at
OUTPUT: Session
PERSISTENCE_TARGET: practice_management.sessions
```

Standard Capture and future Quick Capture MUST write the same domain objects. Quick Capture is not implemented.

## VIEW CONTRACTS

### Client Directory

```text
PRIMARY DATA: clients
DISPLAY: name, estado, email, phone
ACTIONS: create, open Client Detail
FILTER: estado
SEARCH: nombre + apellido, email, telefono
SORT: recent (created_at descending) or name (es-PY)
NAVIGATION: selected client → Client Detail
```

### Client Detail and Client Create/Edit

```text
PRIMARY DATA: selected Client
RELATED DATA: Session history through Sesiones tab
DISPLAY: phone, email, estado, notes; Datos/Sesiones tabs
ACTIONS: edit Client; open Sesiones; add/open Session
NAVIGATION: Client Directory ↔ selected Client context
```

### Client Sessions and Session Create/Detail/Edit

```text
PRIMARY DATA: Sessions scoped to current Client
DISPLAY: fecha, hora_inicio, estado, duration when present; full form on edit
ACTIONS: create Session, open Session, update Session
FILTER: none
SORT/ORDER: fecha descending, then hora_inicio descending
NAVIGATION: remains inside owning Client Detail; no global Sessions view
```

## RETRIEVAL

```text
CLIENT
PRIMARY: Client Directory
SEARCH: nombre + apellido, email, telefono
FILTER: estado
DETAIL: Client Detail
SERVER ORDER: apellido ascending, nombre ascending

SESSION
PRIMARY: Client Detail → Sesiones
SCOPE: session.client_id = current client.id
ORDER: fecha descending, hora_inicio descending
GLOBAL VIEW: no
```

## DERIVATIONS / ANALYTICS

```text
DERIVATION RULE
A metric must define SOURCE, FILTER, OPERATION, OUTPUT, and MEANING.
Derived values must not claim information unsupported by stored data.
Money received ≠ outstanding balance.
```

No payment fields or analytics implementation exist.

## PERSISTENCE CONTRACT

```text
CREATE: input → validation → Supabase INSERT → persisted database row → query/state refresh → UI
UPDATE: persisted record → edit → validation → Supabase UPDATE → persisted database row → UI
RELOAD: database → query → UI reconstruction
```

The configured browser client explicitly uses `practice_management`. A visibly labelled in-memory demo mode exists only when Supabase configuration is absent; it is not persistence.

## ACCESS

```text
SCHEMA: practice_management
DEVELOPMENT BROWSER ROLE: anon
clients: SELECT / INSERT / UPDATE; NO DELETE
sessions: SELECT / INSERT / UPDATE; NO DELETE
AUTH: not implemented
OWNERSHIP: not implemented
RLS: deferred; not production-ready
REAL SENSITIVE DATA: not permitted in current development state
```

## DELIVERY

```text
FRONTEND: React + Vite
DATA: Supabase / PostgreSQL
HOST: Cloudflare — preferred candidate, replaceable, not implemented
DOMAIN: TBD
TARGET CLIENTS: desktop, tablet, phone
PWA: planned
HOME-SCREEN INSTALLATION: planned
NATIVE IOS: not planned initially
NATIVE ANDROID: not planned initially
APP STORE DISTRIBUTION: not required initially
```

## VERIFICATION STATE

| Object | DB | Create | Read | Update | Reload | Validation | Relationship |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Client | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| Session | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

Verification evidence is recorded in `docs/BUILD_LOG.md`.

## COMPLETED SLICES

```text
SLICE 1 — Client Directory — COMPLETE
Client → Create → Persist → Directory → Detail → Edit → Persist → Reload

SLICE 2 — Client Sessions — COMPLETE
Client → Create Session → Persist → Client Session History → Detail → Edit → Persist → Reload
CHECKPOINT: 4bc2a6aa5b7ec76916175c881508b754adc60ddf
```

## DEFERRED

Planned: authentication; user/workspace ownership; RLS production hardening; payments; follow-ups; notes; Quick Capture UI; analytics implementation; Cloudflare deployment; PWA; production deployment.

Deferred: Appointment/Scheduling.

`Built` means implemented in code and schema; `verified` means evidence is recorded in the build log; `planned` and `deferred` are not implementation status.
