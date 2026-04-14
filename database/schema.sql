-- E-Portal Platform Database Schema
-- Last Updated: 2026-04-14

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
