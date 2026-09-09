# Core model

The Client Directory establishes the first implemented core object: Client. Its stored fields are `id`, `nombre`, `apellido`, `telefono`, `email`, `notas`, `estado`, `created_at`, and `updated_at`.

Session is the second implemented core object. `practice_management.sessions` belongs directly to exactly one Client through `client_id`: Client 1 → N Sessions. A Session stores `id`, `client_id`, `fecha`, `hora_inicio`, optional `duracion_minutos`, `estado`, optional `notas`, `created_at`, and `updated_at`. Its allowed states are `programada`, `completada`, and `cancelada`.

Contact, Follow-up, and Note remain candidate concepts only. Appointment and Payment are implemented as Client-owned records; Session is not a scheduling or payment object.
