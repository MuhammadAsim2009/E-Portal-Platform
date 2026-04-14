# E-Portal Platform

## What This Is

The E-Portal Platform is a full-stack, cloud-native web application that consolidates academic and administrative operations for educational institutions into a single, secure, role-based portal. It serves students, faculty, and administrators with specialized services and dashboards.

## Core Value

Providing a unified, secure, and automated portal for all academic and administrative needs, eliminating data fragmentation and manual workflows.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Secure Authentication (JWT + MFA)
- [ ] Student Services (Registration, assignments, attendance, fees)
- [ ] Faculty Services (Course management, grading, attendance)
- [ ] Admin Services (Enrollment, timetables, fee accounting)
- [ ] Cloud Storage (AWS S3)
- [ ] Notifications (Email, SMS, In-App)
- [ ] Analytics Dashboards

### Out of Scope

- [N/A] — No explicit exclusions yet.

## Context

- University of Larkana — Department of Computer Science.
- Built with ES6 Modules + React (JSX).
- No TypeScript.
- Cloud-Native (AWS).

## Constraints

- **Tech Stack**: React 18, Node.js (Express), PostgreSQL, Redis, AWS. — Explicitly specified in README.md.
- **Language**: JavaScript (ES6 Modules) - No TypeScript. — Project requirement.
- **Timeline**: 6 days (Phase 1-6). — Defined in roadmap.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| ES6 Modules Only | Native support, modern standards | — Pending |
| No ORM | Direct SQL control for PostgreSQL | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-14 after initialization*
