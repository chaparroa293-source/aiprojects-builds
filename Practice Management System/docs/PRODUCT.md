# Product

The canonical logical contract for established objects and operations is [TECHNICAL_SPEC.md](../TECHNICAL_SPEC.md).

## Purpose

Practice Management System is a reusable practice-management system for independent, session-based professionals, initially tutors and psychologists. It should help a professional operate, remember, and understand their practice without requiring administrative expertise.

## Product areas

- **Operate:** clients, scheduling, sessions, payments, follow-ups.
- **Remember:** history, notes, directory.
- **Understand:** reporting and practice analytics.
- **Capture:** a cross-product principle: recording what happened should require minimal navigation and required input.

## Current implementation

Slice 1 implements the Client Directory. Slice 2 adds Session history within a client's detail: a professional can record, persist, view, edit, and reload a session without leaving that client context. A session records what happened, when, and its status; it contains no payment truth.

## Not yet implemented

Global scheduling/Agenda, Appointment → Session conversion, payments, follow-ups, reporting, authentication, deployment, and AI/natural-language capture are not implemented. Client-scoped Appointment Agenda is implemented.
