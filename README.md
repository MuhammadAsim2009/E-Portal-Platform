# E-Portal Platform - Cloud-Based Academic Management

Welcome to the **E-Portal Platform**, a high-performance, full-stack Academic Management System designed for the University of Larkana. This platform centralizes academic operations, financial management, and institutional communication into a unified, cloud-native experience.

---

## 🚀 Project Overview
**E-Portal Platform** is a sophisticated Learning and Management System (LMS) that bridges the gap between students, faculty, and administrators. It handles everything from course enrollments and attendance tracking to complex fee management and financial reporting.

### Key Metrics & Scope
- **Architecture**: Monorepo-style structure with decoupled Frontend (React) and Backend (Node.js).
- **Primary Database**: PostgreSQL (Hosted on AWS RDS).
- **Media Storage**: AWS S3 with pre-signed URLs for secure document/receipt handling.
- **Roles**: Admin, Faculty, Student, and Guest.
- **Real-time**: Socket.io for instant notifications and broadcast alerts.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 19 (Latest stable)
- **Build Tool**: Vite
- **State Management**: Zustand (Global state)
- **Styling**: Tailwind CSS (with modern aesthetics)
- **Animations**: Framer Motion
- **Routing**: React Router v7
- **Icons**: Lucide React
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express 5 (Modern, high-performance)
- **Database**: PostgreSQL (via `pg` driver)
- **Real-time**: Socket.io
- **Task Scheduling**: Node-cron (for automated maintenance and reports)
- **Security**: 
  - JWT (JSON Web Tokens) for role-based auth
  - Bcrypt (Password hashing)
  - Joi (Schema validation)
  - CORS & Helmet (Security headers)
- **Communication**: 
  - Nodemailer (Email notifications via SMTP/AWS SES)
  - Multer-S3 (Streamlined file uploads directly to AWS)

---

## 🏗 Deep Architectural Analysis

### 1. Unified Admin Workflow
The platform features a centralized administration layer (`admin.service.js`) that manages the entire institutional lifecycle:
- **Approval System**: Course creation and updates follow a strict request-approval workflow.
- **Global Settings**: Dynamic configuration of site content (About, Contact, Stats) without code changes.
- **Support Hub**: A dedicated inbox for managing and replying to student/faculty inquiries.

### 2. Scalable Financial Engine
Built to handle complex academic billing:
- **Dynamic Fee Structures**: Configure fees per program, semester, and specific course sections.
- **JazzCash Integration**: Seamless payment processing with automated status updates.
- **Audit Trails**: Every financial transaction and administrative action is logged for compliance.

### 3. Automated Academic Tasks
Using `node-cron`, the system performs background operations:
- **Attendance Summary**: Daily/Monthly aggregation of student presence.
- **Fee Deadlines**: Automated status updates for pending payments.
- **Cleanup Jobs**: Regular maintenance of expired notifications and temporary files.

### 4. Secure File Management
Instead of exposing public storage buckets, the platform utilizes:
- **AWS S3**: Industry-standard reliability for storing assignment submissions and receipts.
- **Pre-signed URLs**: Temporary, secure access links generated on-the-fly for private documents.

---

## 🌟 Core Functionalities

### 🎓 For Students
- **Course Enrollment**: Browse and enroll in available course sections.
- **Academics**: View timetables, attendance history, and grades.
- **Finance**: View fee challans and pay online via JazzCash.
- **Communication**: Receive real-time announcements and broadcast alerts.

### 👨‍🏫 For Faculty
- **Section Management**: Manage attendance and grading for assigned sections.
- **Course Requests**: Propose new courses or modifications to existing ones.
- **Timetable**: Real-time view of daily teaching schedules.
- **Interaction**: Receive student assignments and provide feedback.

### ⚙️ For Administrators
- **Institutional Analytics**: High-level overview of revenue, enrollment trends, and user growth.
- **Course Governance**: Approve/Reject faculty requests and manage the master course list.
- **Financial Control**: Manage fee structures, verify payments, and generate reports.
- **Public CMS**: Manage all dynamic content on the public-facing pages.

---

## 📁 Project Structure

```
e-portal-platform/
├── client/               # React Application (Vite)
│   ├── src/
│   │   ├── pages/        # Dashboard views (Admin/Faculty/Student)
│   │   ├── components/   # UI Library & Layouts
│   │   ├── store/        # Zustand state stores (Auth, Settings)
│   │   ├── services/     # API Client (Axios interceptors)
│   │   └── hooks/        # Custom logic (useAuth, useNotifications)
├── server/               # Node.js Server (Express)
│   ├── config/           # DB & AWS Cloud configurations
│   ├── controllers/      # Request handlers
│   ├── routes/           # API Endpoints
│   ├── services/         # Core Business Logic
│   └── middleware/       # JWT Auth & Validation
└── database/             # Schema and initialization scripts
```
