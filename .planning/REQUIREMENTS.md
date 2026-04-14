# Requirements: E-Portal Platform

**Defined:** 2026-04-14
**Core Value:** A unified, secure, and automated portal for educational institutions that consolidates academic and administrative operations.

## v1 Requirements

### Authentication & Access Control
- [ ] **AUTH-01**: Secure JWT-based authentication for students, faculty, and admins.
- [ ] **AUTH-02**: Multi-Factor Authentication (MFA) support.
- [ ] **AUTH-03**: Role-Based Access Control (RBAC) middleware for API routes and frontend pages.
- [ ] **AUTH-04**: Session persistence across client-side refreshes (via Zustand & LocalStorage).

### Student Services
- [ ] **STUD-01**: Dashboard displaying enrolled courses, upcoming assignments, and attendance summary.
- [ ] **STUD-02**: Course registration/enrollment module.
- [ ] **STUD-03**: Assignment submission system with file uploads (S3).
- [ ] **STUD-04**: Fee statement viewing and digital payment tracking.
- [ ] **STUD-05**: Real-time attendance tracking visualization.

### Faculty Services
- [ ] **FACL-01**: Dashboard managing assigned courses and student rosters.
- [ ] **FACL-02**: Grade submission and management for assignments.
- [ ] **FACL-03**: Digital attendance marking for course sessions.
- [ ] **FACL-04**: Student evaluation and feedback module.

### Admin & Administrative Services
- [ ] **ADMN-01**: Centralized dashboard for institutional metrics.
- [ ] **ADMN-02**: User management (Student/Faculty enrollment and account lifecycle).
- [ ] **ADMN-03**: Fee accounting and financial summary management.
- [ ] **ADMN-04**: Timetable creation and announcement management (Global/Role-based).

### Cloud & Core Infrastructure
- [ ] **CORE-01**: ES6 Module-only compliance for both Client and Server.
- [ ] **CORE-02**: AWS S3 integration for encrypted document storage (signed URLs).
- [ ] **CORE-03**: Multi-channel notification system (Email, SMS, In-App via Socket.io).
- [ ] **CORE-04**: Containerized deployment via Docker and GitHub Actions CI/CD.

## v2 Requirements
- **V2-01**: Real-time chat between students and faculty.
- **V2-02**: Mobile application versions (Native).
- **V2-03**: Advanced AI-driven student performance analytics.

## Out of Scope
| Feature | Reason |
|---------|--------|
| TypeScript | Explicitly excluded per project requirements |
| Full CMS for University Website | Scope limited to the portal platform |

## Traceability
| Requirement | Phase | Status |
|-------------|-------|--------|
| CORE-01 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| AUTH-03 | Phase 2 | Pending |
| STUD-01 | Phase 3 | Pending |
| FACL-01 | Phase 4 | Pending |
| ADMN-01 | Phase 5 | Pending |
| CORE-02 | Phase 6 | Pending |
| CORE-03 | Phase 6 | Pending |
| CORE-04 | Phase 7 | Pending |

---
*Last updated: 2026-04-14 after initial discovery*
