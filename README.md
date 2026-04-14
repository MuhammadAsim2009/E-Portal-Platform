# 🚀 E-Portal Platform

> **Cloud-Based Educational & Administrative Services Portal**  
> University of Larkana — Department of Computer Science  
> Built with ES6 Modules + React (JSX) · No TypeScript · Cloud-Native

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Team](#-team)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Phase 1 — Requirements & Design](#-phase-1--requirements--design-weeks-12)
- [Phase 2 — Core Development](#-phase-2--core-development-weeks-35)
- [Phase 3 — Admin, Storage & Notifications](#-phase-3--admin-storage--notifications-weeks-67)
- [Phase 4 — Cloud Deployment](#-phase-4--cloud-deployment-weeks-89)
- [Phase 5 — Testing & QA](#-phase-5--testing--qa-weeks-1011)
- [Phase 6 — Docs & Launch](#-phase-6--documentation--launch-week-12)
- [Feature Modules](#-feature-modules)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Contributing](#-contributing)

---

## 🌐 Project Overview

The **E-Portal Platform** is a full-stack, cloud-native web application that consolidates academic and administrative operations for educational institutions into a single, secure, role-based portal.

### Core Problems Solved

| Problem | Solution |
|---|---|
| Fragmented data across systems | Single unified portal |
| No remote accessibility | Cloud-hosted, browser-based |
| Manual fee & enrollment processes | Automated digital workflows |
| Communication gaps | Multi-channel notification system |
| No performance visibility | Real-time analytics dashboards |

### Key Features

- 🔐 **Secure Auth** — JWT + MFA, role-based access (Student / Faculty / Admin)
- 🎓 **Student Services** — Registration, assignments, attendance, fee payment
- 👨‍🏫 **Faculty Services** — Course management, grading, attendance, evaluations
- 🏛️ **Admin Services** — Enrollment, timetables, fee accounting, announcements
- ☁️ **Cloud Storage** — AWS S3 / GCS with signed URLs, AES-256 encryption
- 🔔 **Notifications** — Email (SES), SMS (Twilio), In-App (WebSocket)
- 📊 **Analytics** — Role-specific dashboards with drill-down reporting

---

## 👥 Team

| Name | Roll No | Role |
|---|---|---|
| Moazam Ali | 2K23/LCS/38 | Lead Developer |
| Nouman Saeed | 2K23/LCS/48 | Backend Developer |
| Sajjad Abbasi | 2K23/LCS/57 | Frontend Developer |
| Siraj Ali | 2K23/LCS/64 | DevOps & Cloud |

**Supervisor:** Mam Saba Noorani  
**Institution:** University of Larkana, Department of Computer Science  
**Date:** January 2026

---

## 🛠️ Tech Stack

### Frontend
```
React 18          — UI framework (JSX, no TypeScript)
ES6 Modules       — Native import/export, no CommonJS
React Router v6   — Client-side routing
Zustand           — Lightweight state management
Axios             — HTTP client
Recharts          — Analytics charts
Tailwind CSS      — Utility-first styling
Vite              — Build tool (native ESM support)
```

### Backend
```
Node.js (Express) — REST API server
ES6 Modules       — "type": "module" in package.json
JWT               — Stateless authentication
bcrypt            — Password hashing
Multer            — File upload handling
Socket.io         — Real-time in-app notifications
Joi               — Request validation
```

### Database & Storage
```
PostgreSQL        — Primary relational database (AWS RDS)
Redis             — Session cache, rate limiting
AWS S3            — Document & file storage
```

### Cloud & DevOps
```
AWS (EC2/ECS)     — Application hosting
Docker            — Containerization
GitHub Actions    — CI/CD pipeline
AWS CloudWatch    — Monitoring & logging
Nginx             — Reverse proxy
```

### Notifications
```
AWS SES / SendGrid  — Email delivery
Twilio              — SMS gateway
Socket.io           — In-app push notifications
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                      │
│              React SPA (Vite + ES6 Modules)             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼──────────────────────────────────┐
│                   NGINX REVERSE PROXY                   │
└───────────┬──────────────────────┬──────────────────────┘
            │                      │
┌───────────▼──────────┐  ┌────────▼───────────────────── ┐
│    REST API SERVER   │  │     SOCKET.IO SERVER          │
│  Node.js + Express   │  │   (Real-time Notifications)   │
│    ES6 Modules       │  └────────────────────────────────┘
└───────────┬──────────┘
            │
┌───────────▼──────────────────────────────────────────── ┐
│                    SERVICE LAYER                        │
│  AuthService │ StudentService │ FacultyService          │
│  AdminService │ NotificationService │ AnalyticsService  │
└───────────┬──────────────────────────────────────────── ┘
            │
┌───────────▼────────┐  ┌──────────────┐  ┌─────────────┐
│    PostgreSQL      │  │    Redis     │  │   AWS S3    │
│  (AWS RDS)         │  │   (Cache)    │  │  (Storage)  │
└────────────────────┘  └──────────────┘  └─────────────┘
```

---

## 📁 Project Structure

```
e-portal/
├── client/                          # React Frontend (ES6 Modules + JSX)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json                 # "type": "module"
│   └── src/
│       ├── main.jsx                 # App entry point
│       ├── App.jsx                  # Root component + routing
│       ├── assets/                  # Static assets
│       ├── components/              # Reusable UI components
│       │   ├── common/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Sidebar.jsx
│       │   │   ├── NotificationBell.jsx
│       │   │   ├── ProtectedRoute.jsx
│       │   │   └── Modal.jsx
│       │   ├── student/
│       │   │   ├── CourseCard.jsx
│       │   │   ├── AssignmentList.jsx
│       │   │   ├── AttendanceChart.jsx
│       │   │   └── FeeStatement.jsx
│       │   ├── faculty/
│       │   │   ├── CourseManager.jsx
│       │   │   ├── GradingPanel.jsx
│       │   │   └── AttendanceMarker.jsx
│       │   └── admin/
│       │       ├── EnrollmentForm.jsx
│       │       ├── TimetableGrid.jsx
│       │       └── AnnouncementEditor.jsx
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── Login.jsx
│       │   │   └── ResetPassword.jsx
│       │   ├── student/
│       │   │   ├── StudentDashboard.jsx
│       │   │   ├── Courses.jsx
│       │   │   ├── Assignments.jsx
│       │   │   ├── Attendance.jsx
│       │   │   └── Fees.jsx
│       │   ├── faculty/
│       │   │   ├── FacultyDashboard.jsx
│       │   │   ├── MyCourses.jsx
│       │   │   ├── Assignments.jsx
│       │   │   └── Students.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── Enrollment.jsx
│       │       ├── FeeManagement.jsx
│       │       ├── Timetable.jsx
│       │       └── Announcements.jsx
│       ├── store/                   # Zustand state stores
│       │   ├── authStore.js
│       │   ├── notificationStore.js
│       │   └── uiStore.js
│       ├── hooks/                   # Custom React hooks
│       │   ├── useAuth.js
│       │   ├── useSocket.js
│       │   └── useApi.js
│       ├── services/                # API call abstractions
│       │   ├── api.js               # Axios instance
│       │   ├── authService.js
│       │   ├── studentService.js
│       │   ├── facultyService.js
│       │   └── adminService.js
│       └── utils/
│           ├── formatDate.js
│           ├── validators.js
│           └── constants.js
│
├── server/                          # Node.js Backend (ES6 Modules)
│   ├── package.json                 # "type": "module"
│   ├── server.js                    # Entry point
│   ├── app.js                       # Express app setup
│   ├── config/
│   │   ├── db.js                    # PostgreSQL connection
│   │   ├── redis.js                 # Redis client
│   │   ├── s3.js                    # AWS S3 client
│   │   └── env.js                   # Env variable loader
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── student.routes.js
│   │   ├── faculty.routes.js
│   │   ├── admin.routes.js
│   │   ├── storage.routes.js
│   │   └── analytics.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── student.controller.js
│   │   ├── faculty.controller.js
│   │   ├── admin.controller.js
│   │   ├── storage.controller.js
│   │   └── analytics.controller.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── emailService.js          # AWS SES / SendGrid
│   │   ├── smsService.js            # Twilio
│   │   ├── storageService.js        # S3 operations
│   │   └── notificationService.js
│   ├── middleware/
│   │   ├── authenticate.js          # JWT verification
│   │   ├── authorize.js             # RBAC middleware
│   │   ├── rateLimiter.js           # Redis-based rate limiting
│   │   ├── validate.js              # Joi request validation
│   │   └── errorHandler.js
│   ├── models/                      # DB query models (no ORM)
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Assignment.js
│   │   ├── Attendance.js
│   │   ├── Fee.js
│   │   └── Announcement.js
│   └── sockets/
│       └── notificationSocket.js    # Socket.io handlers
│
├── database/
│   ├── schema.sql                   # Full DB schema
│   ├── seeds/                       # Dev seed data
│   └── migrations/                  # Schema migrations
│
├── docker/
│   ├── Dockerfile.client
│   ├── Dockerfile.server
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       └── deploy.yml               # CI/CD pipeline
│
├── .env.example
└── README.md
```

---

## ✅ Phase 1 — Requirements & Design (Weeks 1–2)

### Goals
- Finalize all functional and non-functional requirements
- Design database schema
- Create wireframes for all 3 user dashboards
- Set up monorepo structure and tooling

### Deliverables
- [x] Product Requirements Document (PRD)
- [ ] Database ERD and SQL schema
- [ ] Wireframes (Figma) — Student, Faculty, Admin dashboards
- [ ] API contract (OpenAPI/Swagger spec)
- [ ] Project repo initialized with folder structure

### Database Schema (Key Tables)

```sql
-- Users table (all roles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student', 'faculty', 'admin')) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(150) NOT NULL,
  credit_hours INT NOT NULL,
  faculty_id UUID REFERENCES users(id),
  semester VARCHAR(20),
  max_seats INT DEFAULT 40,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments (Student ↔ Course)
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(student_id, course_id)
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline TIMESTAMP NOT NULL,
  max_marks INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES users(id),
  file_url TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  marks INT,
  feedback TEXT,
  is_late BOOLEAN DEFAULT false
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  student_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  status VARCHAR(10) CHECK (status IN ('present','absent','late','excused')),
  marked_by UUID REFERENCES users(id)
);

-- Fees
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  semester VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMP,
  receipt_url TEXT,
  due_date DATE
);
```

### Setup Commands

```bash
# Clone and install
git clone https://github.com/your-org/e-portal.git
cd e-portal

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install

# Set up environment variables
cp .env.example .env
# → Edit .env with your DB, AWS, Twilio credentials

# Initialize database
psql -U postgres -f database/schema.sql
node database/seeds/run.js
```

---

## 🔨 Phase 2 — Core Development (Weeks 3–5)

### Goals
- Build authentication system (JWT + MFA)
- Build all Student Service modules
- Build all Faculty Service modules
- Set up React routing and base layout

### ES6 Module Conventions

> ⚠️ This project uses **ES6 Modules exclusively**. No `require()`. No CommonJS.

```js
// ✅ CORRECT — ES6 Module syntax
import express from 'express';
import { getUserById } from '../models/User.js';
export const login = async (req, res) => { ... };

// ❌ WRONG — Never use CommonJS
const express = require('express');
module.exports = { login };
```

**Server `package.json`:**
```json
{
  "type": "module",
  "scripts": {
    "dev": "node --watch server.js",
    "start": "node server.js"
  }
}
```

**Vite config for client:**
```js
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/socket.io': { target: 'http://localhost:5000', ws: true }
    }
  }
});
```

### Authentication Module

```js
// server/services/authService.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, updateUserMFA } from '../models/User.js';

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );

  return { token, user: { id: user.id, name: user.name, role: user.role } };
};
```

```jsx
// client/src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService.js';
import useAuthStore from '../../store/authStore.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { token, user } = await login(form.email, form.password);
    localStorage.setItem('token', token);
    setUser(user);
    navigate(`/${user.role}/dashboard`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" value={form.password}
        onChange={e => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Login</button>
    </form>
  );
}
```

### RBAC Middleware

```js
// server/middleware/authorize.js
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

// Usage in routes
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

router.get('/grades', authenticate, authorize('student'), getMyGrades);
router.post('/grade', authenticate, authorize('faculty'), submitGrade);
```

### Protected Route (React)

```jsx
// client/src/components/common/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore.js';

export default function ProtectedRoute({ children, roles }) {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}
```

---

## 🏛️ Phase 3 — Admin, Storage & Notifications (Weeks 6–7)

### Goals
- Build all Admin Service modules
- Integrate AWS S3 cloud storage
- Build multi-channel notification system
- Socket.io real-time in-app notifications

### Cloud Storage Integration

```js
// server/config/s3.js
import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});
```

```js
// server/services/storageService.js
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../config/s3.js';

export const uploadFile = async (file, key) => {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ServerSideEncryption: 'AES256',
  }));
  return key;
};

export const getSignedFileUrl = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
};
```

### Notification Service

```js
// server/services/notificationService.js
import { sendEmail } from './emailService.js';
import { sendSMS } from './smsService.js';
import { emitToUser } from '../sockets/notificationSocket.js';

export const notify = async ({ userId, type, message, channels = ['inapp'] }) => {
  const tasks = channels.map(channel => {
    if (channel === 'email') return sendEmail(userId, type, message);
    if (channel === 'sms')   return sendSMS(userId, message);
    if (channel === 'inapp') return emitToUser(userId, { type, message });
  });
  await Promise.allSettled(tasks);
};
```

```js
// server/sockets/notificationSocket.js
const userSockets = new Map();

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('register', (userId) => {
      userSockets.set(userId, socket.id);
    });
    socket.on('disconnect', () => {
      for (const [uid, sid] of userSockets) {
        if (sid === socket.id) userSockets.delete(uid);
      }
    });
  });
};

export const emitToUser = (io, userId, payload) => {
  const socketId = userSockets.get(userId);
  if (socketId) io.to(socketId).emit('notification', payload);
};
```

---

## ☁️ Phase 4 — Cloud Deployment (Weeks 8–9)

### Goals
- Dockerize all services
- Set up CI/CD pipeline via GitHub Actions
- Deploy to AWS (ECS or EC2)
- Configure Nginx reverse proxy
- Set up CloudWatch monitoring

### Docker Setup

```dockerfile
# docker/Dockerfile.server
FROM node:20-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ .
EXPOSE 5000
CMD ["node", "server.js"]
```

```dockerfile
# docker/Dockerfile.client
FROM node:20-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

```yaml
# docker/docker-compose.yml
version: '3.9'
services:
  client:
    build:
      context: .
      dockerfile: docker/Dockerfile.client
    ports: ["80:80"]
    depends_on: [server]

  server:
    build:
      context: .
      dockerfile: docker/Dockerfile.server
    ports: ["5000:5000"]
    env_file: .env
    depends_on: [postgres, redis]

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: eportal
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes: [pgdata:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy E-Portal

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: cd server && npm ci && npm test
      - run: cd client && npm ci && npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build and push Docker images
        run: |
          docker build -f docker/Dockerfile.server -t eportal-server .
          docker build -f docker/Dockerfile.client -t eportal-client .
      - name: Deploy to AWS ECS
        run: |
          aws ecs update-service --cluster eportal-cluster \
            --service eportal-service --force-new-deployment
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: us-east-1
```

---

## 🧪 Phase 5 — Testing & QA (Weeks 10–11)

### Goals
- Unit tests for all service functions
- Integration tests for all API routes
- Frontend component tests
- Security audit (OWASP Top 10)
- Load testing with k6

### Testing Stack

```
Vitest      — Unit & integration testing (server + client)
Supertest   — HTTP API testing
React Testing Library — Component testing
k6          — Load/performance testing
```

### Example Tests

```js
// server/tests/auth.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('POST /api/auth/login', () => {
  it('returns token on valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'student@test.com',
      password: 'Test1234!'
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('returns 401 on invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'student@test.com',
      password: 'wrongpassword'
    });
    expect(res.status).toBe(401);
  });
});
```

```js
// k6/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,         // 100 virtual users
  duration: '30s',
};

export default function () {
  const res = http.post('https://your-domain.com/api/auth/login', JSON.stringify({
    email: 'student@test.com',
    password: 'Test1234!'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(res, {
    'status is 200': r => r.status === 200,
    'response < 500ms': r => r.timings.duration < 500,
  });
  sleep(1);
}
```

### Security Checklist

- [ ] All inputs sanitized (no raw SQL, XSS prevention)
- [ ] JWT tokens expire in 30 min, refresh token rotation implemented
- [ ] Rate limiting active on `/api/auth/*` (10 req/min per IP)
- [ ] CORS restricted to allowed origins only
- [ ] S3 buckets are private (no public access)
- [ ] All passwords hashed with bcrypt (cost factor ≥ 12)
- [ ] HTTPS enforced, HTTP redirects to HTTPS
- [ ] Dependency audit: `npm audit --production`

---

## 📄 Phase 6 — Documentation & Launch (Week 12)

### Goals
- Complete API documentation (Swagger)
- Write user manuals for all 3 roles
- Final demo to supervisor
- Performance benchmarks report
- Project report submission

### Deliverables Checklist

- [ ] README.md (this file) — complete and up to date
- [ ] API docs at `/api/docs` (Swagger UI)
- [ ] Student user manual (PDF)
- [ ] Faculty user manual (PDF)
- [ ] Admin user manual (PDF)
- [ ] Load test benchmark report
- [ ] Final project report (university format)
- [ ] Recorded demo video

---

## 📡 API Reference

### Base URL
```
Development:  http://localhost:5000/api
Production:   https://your-domain.com/api
```

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | None | Login, returns JWT |
| POST | `/auth/logout` | JWT | Invalidate session |
| POST | `/auth/refresh` | Refresh token | Get new access token |
| POST | `/auth/forgot-password` | None | Send OTP to email |
| POST | `/auth/reset-password` | OTP | Reset password |

### Student Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/student/courses` | Get enrolled courses |
| POST | `/student/courses/:id/enroll` | Enroll in course |
| GET | `/student/assignments` | Get all assignments |
| POST | `/student/assignments/:id/submit` | Submit assignment |
| GET | `/student/attendance` | Get attendance summary |
| GET | `/student/fees` | Get fee details |
| POST | `/student/fees/:id/pay` | Initiate fee payment |

### Faculty Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/faculty/courses` | Get managed courses |
| POST | `/faculty/courses` | Create new course |
| POST | `/faculty/assignments` | Create assignment |
| GET | `/faculty/assignments/:id/submissions` | View submissions |
| POST | `/faculty/submissions/:id/grade` | Submit grade |
| POST | `/faculty/attendance` | Mark attendance |

### Admin Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/students` | Enroll new student |
| GET | `/admin/students` | List all students |
| POST | `/admin/fees/config` | Configure fee structure |
| GET | `/admin/fees/report` | Financial report |
| POST | `/admin/timetable` | Create timetable |
| POST | `/admin/announcements` | Publish announcement |
| GET | `/admin/analytics` | Platform analytics |

---

## 🔧 Environment Variables

Create a `.env` file in the root (copy from `.env.example`):

```env
# ── Server ───────────────────────────────────
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# ── Database ─────────────────────────────────
DB_HOST=localhost
DB_PORT=5432
DB_NAME=eportal
DB_USER=postgres
DB_PASS=your_password

# ── Redis ────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── JWT ──────────────────────────────────────
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=30m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d

# ── AWS ──────────────────────────────────────
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
S3_BUCKET=eportal-files

# ── Email (AWS SES or SendGrid) ───────────────
EMAIL_FROM=noreply@eportal.edu.pk
SENDGRID_API_KEY=your_sendgrid_key
# OR
AWS_SES_REGION=us-east-1

# ── SMS (Twilio) ──────────────────────────────
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE=+1234567890

# ── Payment Gateway ───────────────────────────
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
```

---

## 🚀 Getting Started

### Prerequisites

```
Node.js >= 20.x
npm >= 10.x
PostgreSQL >= 15
Redis >= 7
Docker (optional, for containerized setup)
```

### Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/e-portal.git
cd e-portal

# 2. Setup Client
cd client
npm install
cp .env.example .env.local
npm run dev          # Starts on http://localhost:3000

# 3. Setup Server (new terminal)
cd server
npm install
cp ../.env.example .env
npm run dev          # Starts on http://localhost:5000

# 4. Initialize Database
psql -U postgres -c "CREATE DATABASE eportal;"
psql -U postgres -d eportal -f ../database/schema.sql
node ../database/seeds/run.js
```

### Docker Setup (Recommended)

```bash
# Build and start all services
docker compose -f docker/docker-compose.yml up --build

# Access the app
open http://localhost         # Client
open http://localhost:5000    # API
```

### Default Login Credentials (Dev Seed Data)

| Role | Email | Password |
|---|---|---|
| Student | student@eportal.test | Test1234! |
| Faculty | faculty@eportal.test | Test1234! |
| Admin | admin@eportal.test | Test1234! |

---

## 📜 Scripts

### Client

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
npm run test       # Run Vitest tests
npm run lint       # ESLint check
```

### Server

```bash
npm run dev        # Start with --watch (hot reload)
npm start          # Production start
npm test           # Run Vitest + Supertest
npm run lint       # ESLint check
```

### Database

```bash
node database/seeds/run.js       # Seed development data
psql -f database/schema.sql      # Reset schema
```

---

## 🤝 Contributing

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Commit with convention: `git commit -m "feat: add assignment grading API"`
3. Push and open a Pull Request to `main`
4. PR must pass all CI checks before merge

### Commit Message Convention

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Formatting, no logic change
refactor: Code refactor
test:     Adding tests
chore:    Config, dependencies
```

---

## 📄 License

This project is developed for academic purposes at the University of Larkana.  
© 2026 — Moazam Ali, Nouman Saeed, Sajjad Abbasi, Siraj Ali. All rights reserved.

---

<div align="center">
  <strong>Built with ❤️ at University of Larkana</strong><br/>
  <em>E-Portal Platform — Cloud-Based Educational Services</em>
</div>
