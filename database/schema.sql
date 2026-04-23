-- E-Portal Platform Database Schema v2 (aligned with db_schema.md)
-- Last Updated: 2026-04-14

-- Core Tables
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student', 'faculty', 'admin')) NOT NULL,
  registration_status VARCHAR(20) DEFAULT 'pending' CHECK (registration_status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE students (
  student_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  cnic VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(10),
  contact_number VARCHAR(20),
  program VARCHAR(100),
  semester VARCHAR(20),
  batch VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'withdrawn', 'alumni')),
  gpa DECIMAL(3,2)
);

CREATE TABLE faculty (
  faculty_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  department VARCHAR(100),
  designation VARCHAR(100),
  contact_number VARCHAR(20),
  qualifications TEXT
);

CREATE TABLE courses (
  course_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(150) NOT NULL,
  credit_hours INT NOT NULL,
  description TEXT,
  syllabus_url TEXT,
  department VARCHAR(100),
  semester_offered VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE course_sections (
  section_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(course_id) ON DELETE CASCADE,
  faculty_id UUID REFERENCES faculty(faculty_id),
  section_name VARCHAR(50) NOT NULL,
  room VARCHAR(50),
  day_of_week VARCHAR(50),
  start_time TIME,
  end_time TIME
  -- max_seats comes from courses.max_seats
  -- current enrollment count comes from COUNT(enrollments) 
);

CREATE TABLE enrollments (
  enrollment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  section_id UUID REFERENCES course_sections(section_id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'dropped')),
  grade VARCHAR(5),
  UNIQUE(student_id, section_id)
);

CREATE TABLE assignments (
  assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES course_sections(section_id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline TIMESTAMP NOT NULL,
  max_marks INT DEFAULT 100,
  submission_type VARCHAR(50),
  created_by UUID REFERENCES faculty(faculty_id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE submissions (
  submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  file_url TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  is_late BOOLEAN DEFAULT false,
  marks_obtained INT,
  feedback TEXT,
  graded_by UUID REFERENCES faculty(faculty_id),
  graded_at TIMESTAMP
);

CREATE TABLE attendance (
  attendance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES course_sections(section_id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status VARCHAR(10) CHECK (status IN ('present','absent','late','excused')),
  marked_by UUID REFERENCES faculty(faculty_id)
);

CREATE TABLE fees (
  fee_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  semester VARCHAR(20) NOT NULL,
  fee_type VARCHAR(50),
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'waived')),
  discount_amount DECIMAL(10,2) DEFAULT 0,
  waiver_justification TEXT,
  notes TEXT,
  CONSTRAINT fees_student_semester_type_unique UNIQUE (student_id, semester, fee_type)
);

CREATE TABLE payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(student_id) ON DELETE CASCADE,
  fee_id UUID REFERENCES fees(fee_id) ON DELETE CASCADE,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  transaction_id VARCHAR(100),
  payment_method VARCHAR(50),
  receipt_url TEXT
);

CREATE TABLE IF NOT EXISTS fee_structures (
  structure_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program VARCHAR(100) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  target VARCHAR(255),
  details TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcements (
  announcement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  target_role VARCHAR(20) NOT NULL, -- 'all', 'student', 'faculty', 'individual'
  target_user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  expiry_date DATE,
  is_pinned BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'registration', 'payment', 'enrollment', 'system', 'message'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  is_read BOOLEAN DEFAULT false,
  related_id VARCHAR(255), -- ID of the related resource (user_id, payment_id, etc.)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Global Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Device Tracking for Security
CREATE TABLE IF NOT EXISTS login_devices (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  device_fingerprint VARCHAR(255) NOT NULL,
  user_agent TEXT,
  last_ip VARCHAR(45),
  last_login TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);
