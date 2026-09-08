# Workflows

## Client Directory — Slice 1

Create client → persist client → see client in directory → open client → view stored information → edit client → save changes → verify persistence after reload.

The React interface is implemented in Spanish. With fake development data, the complete workflow is verified against `practice_management.clients`: create → directory read → detail → edit → reload → persisted values. Authentication and production RLS remain deferred.

## Session history — Slice 2

Open client → open Sesiones → see that client's history → add session → persist → open stored session → edit → save → reload → persisted values remain.

The current client is inherited by the session form. `fecha`, `hora_inicio`, and `estado` are required; `duracion_minutos` and `notas` are optional. Fake development verification covered empty history, a session without duration, all allowed states, direct database read, edit, and reload. The fake client and session were removed afterward.

## Client Agenda — Slice 3A

Open client → open Agenda → see that client's empty Agenda → add appointment → persist → open stored appointment → edit → save → reload → persisted values remain.

The current client is inherited by the appointment form and cannot be reassigned there. `fecha` and `hora_inicio` are required; `duracion_minutos` and `notas` are optional; the only states are `programada` and `cancelada`. Fake development verification covered empty Agenda, create, edit, reload, direct ownership/NULL checks, UI validation, and database rejection of an unsupported state. The fake client and appointment were removed afterward. Global Agenda and Appointment → Session conversion are not implemented.
