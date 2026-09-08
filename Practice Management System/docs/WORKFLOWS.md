# Workflows

## Client Directory — Slice 1

Create client → persist client → see client in directory → open client → view stored information → edit client → save changes → verify persistence after reload.

The React interface is implemented in Spanish. With fake development data, the complete workflow is verified against `practice_management.clients`: create → directory read → detail → edit → reload → persisted values. Authentication and production RLS remain deferred.

## Session history — Slice 2

Open client → open Sesiones → see that client's history → add session → persist → open stored session → edit → save → reload → persisted values remain.

The current client is inherited by the session form. `fecha`, `hora_inicio`, and `estado` are required; `duracion_minutos` and `notas` are optional. Fake development verification covered empty history, a session without duration, all allowed states, direct database read, edit, and reload. The fake client and session were removed afterward.
