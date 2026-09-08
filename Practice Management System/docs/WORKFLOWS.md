# Workflows

## Client Directory — Slice 1

Create client → persist client → see client in directory → open client → view stored information → edit client → save changes → verify persistence after reload.

The React interface is implemented in Spanish. With fake development data, the complete workflow is verified against `practice_management.clients`: create → directory read → detail → edit → reload → persisted values. Authentication and production RLS remain deferred.
