# Roadmap: E-Portal Platform

## Overview
This roadmap outlines the development of the E-Portal Platform from local foundation setup to cloud-native deployment. We follow a modular build order, establishing the core Auth layer first, followed by specialized service modules for students, faculty, and administrators.

## Phases
- [ ] **Phase 1: Foundation & Project Setup** - Initialize monorepo, client/server skeletons, and DB schema.
- [ ] **Phase 2: Authentication & Security** - Implement JWT + MFA and Role-Based Access Control.
- [ ] **Phase 3: Student Module Core** - Build Registration, Assignment viewing, and Fee dashboards.
- [ ] **Phase 4: Faculty Module Core** - Build Course Management and Grading tools.
- [ ] **Phase 5: Administrative Module Core** - Build Enrollment and Timetable management.
- [ ] **Phase 6: Cloud Integrations & Notifications** - Integrate S3 storage and notification services.
- [ ] **Phase 7: Deployment & QA** - Dockerization, CI/CD pipeline, and final load testing.

## Phase Details

### Phase 1: Foundation & Project Setup
**Goal**: Establish a working monorepo skeleton with all dependencies and DB schema.
**Depends on**: Nothing
**Requirements**: CORE-01
**Success Criteria**:
  1. `client/` and `server/` projects are initialized with ES6 Module support.
  2. Tailwind CSS and Zustand are configured in the frontend.
  3. `database/schema.sql` is ready for deployment.
  4. Both client and server start successfully in development mode.
**Plans**: 1 plan
- [ ] 01-01-PLAN.md: Initialize skeletons and dependency installation.

### Phase 2: Authentication & Security
**Goal**: Secure the portal with role-based JWT authentication and MFA.
**Depends on**: Phase 1
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04
**Success Criteria**:
  1. Users can sign in/up and receive roles (Admin/Student/Faculty).
  2. API endpoints are protected by role-specific middleware.
  3. Protected routes exist on the frontend.
**Plans**: 2 plans

### Phase 3: Student Module Core
**Goal**: Deliver the primary student experience.
**Depends on**: Phase 2
**Requirements**: STUD-01, STUD-02, STUD-05
**Success Criteria**:
  1. Student can view their personalized dashboard.
  2. Student can register for courses.
**Plans**: TBD

[... remaining phases follow basic structure ...]

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/1 | Not started | - |
| 2. Auth & Security | 0/2 | Not started | - |
| 3. Student Module | 0/TBD | Not started | - |
| 4. Faculty Module | 0/TBD | Not started | - |
| 5. Admin Module | 0/TBD | Not started | - |
| 6. Cloud & Notif | 0/TBD | Not started | - |
| 7. Deployment | 0/TBD | Not started | - |

---
*Last updated: 2026-04-14 after initialization*
