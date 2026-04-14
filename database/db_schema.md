Core Tables:

users
    user_id (PK, UUID)
    username / institutional_email (unique)
    password_hash
    role (enum: student, faculty, admin)
    is_active, mfa_enabled
    created_at, last_login

students (extends users)
    student_id (PK)
    user_id (FK)
    full_name, cnic, date_of_birth, gender, contact_number
    program, semester, batch
    status (active, suspended, withdrawn, alumni)
    gpa (calculated or stored)

faculty (extends users)
    faculty_id (PK)
    user_id (FK)
    full_name, department, designation, contact_number
    qualifications

courses
    course_id (PK)
    course_code (unique), title, credit_hours, description, syllabus_url
    department, semester_offered
    is_active

course_sections (for multiple sections of same course)
    section_id (PK)
    course_id (FK)
    faculty_id (FK)
    section_name, room, schedule_time, max_seats, current_seats

enrollments
    enrollment_id (PK)
    student_id (FK)
    section_id (FK)
    enrollment_date, status (enrolled, dropped)
    grade (final grade)

assignments
    assignment_id (PK)
    section_id (FK)
    title, description, deadline, max_marks, submission_type
    created_by (faculty_id)

submissions
    submission_id (PK)
    assignment_id (FK)
    student_id (FK)
    file_url (S3 link), submitted_at, is_late
    marks_obtained, feedback, graded_by (faculty_id), graded_at

attendance
    attendance_id (PK)
    section_id (FK)
    student_id (FK)
    date, status (present, absent, late, excused)
    marked_by (faculty_id)

fees
    fee_id (PK)
    student_id (FK)
    semester, fee_type (tuition, lab, library, etc.)
    amount, due_date, status (paid, pending, waived)
    discount_amount, notes

payments
    payment_id (PK)
    student_id (FK)
    fee_id (FK)
    amount_paid, payment_date, transaction_id, payment_method (JazzCash, EasyPaisa, Card)
    receipt_url (S3)

timetables
    timetable_id (PK)
    section_id (FK) or batch/department
    day_of_week, start_time, end_time, room
    updated_at

announcements
    announcement_id (PK)
    title, body, category, target_role (all, student, faculty, admin)
    target_department, expiry_date, is_pinned
    created_by (admin_id), created_at

notifications (log table)
    notification_id (PK)
    user_id (FK)
    title, message, type, channel (email, sms, inapp)
    status (sent, delivered, read), sent_at

audit_logs
    log_id (PK)
    user_id (FK)
    action, entity, entity_id, ip_address, timestamp


Additional Supporting Tables:

    departments
    semesters / academic_sessions
    grading_rubrics (optional)
    feedback_forms

Relationships Highlights:

    One student can enroll in many courses (via enrollments)
    One course section has one faculty and many students
    Assignments belong to sections
    Fees and payments link to students

This schema is scalable and covers every feature mentioned in the PRD.