# Architecture

The intended product shape is:

`Core Practice System → profession-specific configuration → small profession-specific adaptations`

Universal concepts may include Contact, Client, Appointment, Session, Payment, Follow-up, and Note. This is a product direction, not an implemented abstraction or schema.

Keep the following sources of truth distinct: product truth belongs in documentation, code truth is the implemented repository behavior, and data truth is what the database schema and migrations actually represent. Documentation does not imply implementation.

Build one complete workflow at a time: define product and data truth, make the minimal database change, implement and connect the UI, manually test, then document the result. Avoid speculative generalized entities, join tables, or configuration systems.
