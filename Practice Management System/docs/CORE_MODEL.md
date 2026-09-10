# Core model

The canonical living domain grammar is [TECHNICAL_SPEC.md](../TECHNICAL_SPEC.md). Do not maintain a second field-level model here.

The implemented persisted core is Client, Appointment, Session, and Payment. Client owns many Appointments, Sessions, and Payments. A Session may reference zero or one same-client Payment; a Payment may be referenced by many Sessions. Appointment is planned work, Session is actual session history, and Payment is money received under the narrow semantics defined in the technical specification.

Quick Capture is an interaction over Session and Payment, not a stored object. Contact, FollowUp, independent Note, Communication, Calendar-integration, Automation, and Analytics models have not been approved. Their product direction and unresolved decisions are preserved in [PRODUCT.md](PRODUCT.md).
