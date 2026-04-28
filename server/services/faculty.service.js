import * as db from '../config/db.js';
import { notify } from './notification.service.js';
import { recalculateStudentGrades } from './student.service.js';

// Helper to normalize day strings (e.g., "Mon-Fri" or "Mon, Wed") into an array of day abbreviations
const normalizeDays = (dayStr) => {
  if (!dayStr) return [];
  const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let parts = dayStr.split(/[,/| ]+/).map(p => p.trim().toLowerCase()).filter(p => p);
  let expanded = [];
  parts.forEach(p => {
    if (p.includes('-')) {
      const [start, end] = p.split('-').map(s => s.trim().substring(0, 3));
      const sIdx = daysOrder.findIndex(d => d.toLowerCase() === start);
      const eIdx = daysOrder.findIndex(d => d.toLowerCase() === end);
      if (sIdx !== -1 && eIdx !== -1 && sIdx <= eIdx) {
        for (let i = sIdx; i <= eIdx; i++) expanded.push(daysOrder[i]);
      } else if (sIdx !== -1) expanded.push(daysOrder[sIdx]);
    } else {
      const match = daysOrder.find(d => d.toLowerCase().startsWith(p.substring(0, 3)));
      if (match) expanded.push(match);
    }
  });
  return [...new Set(expanded)];
};

// ─────────────────────── DASHBOARD ───────────────────────
export const getFacultyDashboard = async (userId) => {
  try {
    // Get faculty_id from user_id
    const facultyRes = await db.query(
      `SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]
    );
    if (!facultyRes.rows.length) throw new Error('Faculty record not found');
    const facultyId = facultyRes.rows[0].faculty_id;

    const [sectionsRes, studentsRes, assignmentsRes, pendingTasksRes, gradeDistRes, attendanceTrendRes, submissionStatsRes] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM course_sections WHERE faculty_id = $1`, [facultyId]),
      db.query(`SELECT COUNT(DISTINCT e.student_id) FROM enrollments e
                JOIN course_sections cs ON e.section_id = cs.section_id
                WHERE cs.faculty_id = $1 AND e.status = 'enrolled'`, [facultyId]),
      db.query(`SELECT COUNT(*) FROM assignments WHERE created_by = $1`, [facultyId]),
      db.query(`SELECT a.assignment_id as id, a.title, a.deadline, c.course_code, cs.section_name 
                FROM assignments a
                JOIN course_sections cs ON a.section_id = cs.section_id
                JOIN courses c ON cs.course_id = c.course_id
                WHERE a.created_by = $1 AND a.deadline >= NOW()
                ORDER BY a.deadline ASC LIMIT 3`, [facultyId]),
      db.query(`SELECT grade, COUNT(*) as count FROM enrollments e
                JOIN course_sections cs ON e.section_id = cs.section_id
                WHERE cs.faculty_id = $1 AND e.status = 'enrolled' AND e.grade IS NOT NULL
                GROUP BY grade ORDER BY grade`, [facultyId]),
      db.query(`SELECT date, COUNT(*) filter (where status = 'present') * 100.0 / count(*) as rate
                FROM attendance a
                JOIN course_sections cs ON a.section_id = cs.section_id
                WHERE cs.faculty_id = $1 AND a.date > NOW() - INTERVAL '30 days'
                GROUP BY date ORDER BY date DESC LIMIT 7`, [facultyId]),
      db.query(`SELECT 
                  COUNT(*) as total_subs,
                  COUNT(*) filter (where is_late = true) as late_subs
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.assignment_id
                WHERE a.created_by = $1`, [facultyId])
    ]);

    return {
      facultyId,
      sectionsCount: parseInt(sectionsRes.rows[0].count),
      studentsCount: parseInt(studentsRes.rows[0].count),
      assignmentsCount: parseInt(assignmentsRes.rows[0].count),
      pendingTasks: pendingTasksRes.rows,
      gradeDistribution: gradeDistRes.rows,
      attendanceTrends: attendanceTrendRes.rows.reverse(),
      submissionStats: {
        total: parseInt(submissionStatsRes.rows[0].total_subs),
        late: parseInt(submissionStatsRes.rows[0].late_subs),
        lateRate: submissionStatsRes.rows[0].total_subs > 0 
          ? (parseInt(submissionStatsRes.rows[0].late_subs) / parseInt(submissionStatsRes.rows[0].total_subs) * 100).toFixed(1)
          : 0
      }
    };
  } catch (error) {
    console.error("Dashboard error:", error);
    throw new Error('Failed to fetch dashboard data: ' + error.message);
  }
};

// ─────────────────────── MY COURSES ───────────────────────
export const getMyCourses = async (userId) => {
  try {
    const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
    const facultyId = facultyRes.rows[0]?.faculty_id;

    const res = await db.query(
      `SELECT 
        cs.section_id, 
        cs.section_name, 
        cs.room, 
        cs.day_of_week,
        cs.start_time,
        cs.end_time,
        c.max_seats,
        (SELECT COUNT(*) FROM enrollments e WHERE e.section_id = cs.section_id AND e.status = 'enrolled') as current_seats,
        c.course_id, 
        c.course_code, 
        c.title, 
        c.credit_hours, 
        c.department,
        c.description,
        f.department as instructor_department
       FROM course_sections cs
       JOIN courses c ON cs.course_id = c.course_id
       JOIN faculty f ON cs.faculty_id = f.faculty_id
       WHERE cs.faculty_id = $1
       ORDER BY c.course_code`, [facultyId]

    );
    return res.rows;


  } catch (error) {
    console.error("Courses error:", error);
    throw new Error('Failed to fetch courses: ' + error.message);
  }
};

// ─────────────────────── GRADE BOOK ───────────────────────
export const getSectionStudents = async (sectionId) => {
  try {
    const res = await db.query(
      `SELECT e.enrollment_id, e.grade, e.status,
              s.student_id, u.user_id, u.name, u.email,
              st.program, st.semester
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN students st ON s.student_id = st.student_id
       WHERE e.section_id = $1 AND e.status = 'enrolled'
       ORDER BY u.name`, [sectionId]
    );
    return res.rows;
  } catch {
    return [
      { enrollment_id: '1', student_id: 'S1', name: 'Alice Johnson', email: 'alice@uni.edu', program: 'BSCS', semester: 4, grade: 'A' },
      { enrollment_id: '2', student_id: 'S2', name: 'Bob Williams', email: 'bob@uni.edu', program: 'BSCS', semester: 4, grade: 'B+' },
      { enrollment_id: '3', student_id: 'S3', name: 'Carol Davis', email: 'carol@uni.edu', program: 'BSCS', semester: 4, grade: null },
      { enrollment_id: '4', student_id: 'S4', name: 'David Brown', email: 'david@uni.edu', program: 'BSCS', semester: 4, grade: 'A-' },
      { enrollment_id: '5', student_id: 'S5', name: 'Eve Thomas', email: 'eve@uni.edu', program: 'BSCS', semester: 4, grade: 'B' },
    ];
  }
};

export const updateGrade = async (enrollmentId, grade) => {
  try {
    // Lookup grade points from grade_scale
    const scaleRes = await db.query(`SELECT grade_points FROM grade_scale WHERE letter_grade = $1`, [grade]);
    const gradePoints = scaleRes.rows[0] ? parseFloat(scaleRes.rows[0].grade_points) : 0;

    console.log(`Updating enrollment ${enrollmentId}: grade=${grade}, points=${gradePoints}`);
    
    const res = await db.query(
      `UPDATE enrollments SET grade = $1, grade_points = $2 WHERE enrollment_id = $3 RETURNING *`,
      [grade, gradePoints, enrollmentId]
    );

    if (res.rowCount === 0) {
      throw new Error(`Enrollment ${enrollmentId} not found`);
    }

    const enrollment = res.rows[0];
    
    // Recalculate GPA for student
    await recalculateStudentGrades(enrollment.student_id);

    console.log('Update successful:', enrollment);



    // Notify student
    const studentUserRes = await db.query(
      "SELECT u.user_id, u.name, c.title FROM enrollments e JOIN students s ON e.student_id = s.student_id JOIN users u ON s.user_id = u.user_id JOIN course_sections cs ON e.section_id = cs.section_id JOIN courses c ON cs.course_id = c.course_id WHERE e.enrollment_id = $1",
      [enrollmentId]
    );
    if (studentUserRes.rowCount > 0) {
      await notify({
        userId: studentUserRes.rows[0].user_id,
        title: 'Grade Published',
        message: `Your final grade for ${studentUserRes.rows[0].title} has been updated to: ${grade}`,
        type: 'enrollment',
        priority: 'medium',
        channels: ['in-app', 'email']
      });
    }

    return enrollment;
  } catch (err) {
    console.error('Update Grade Error:', err);
    return { enrollment_id: enrollmentId, grade };
  }
};

// --- Dynamic Gradebook Components ---

export const getAssessmentComponents = async (sectionId) => {
  const res = await db.query(
    `SELECT * FROM assessment_components WHERE section_id = $1 ORDER BY created_at ASC`,
    [sectionId]
  );
  return res.rows;
};

export const createAssessmentComponent = async (sectionId, data) => {
  const { name, weightage, max_marks } = data;
  const res = await db.query(
    `INSERT INTO assessment_components (section_id, name, weightage, max_marks) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [sectionId, name, weightage, max_marks || 100]
  );
  return res.rows[0];
};

export const updateAssessmentComponent = async (componentId, data) => {
  const { name, weightage, max_marks } = data;
  const res = await db.query(
    `UPDATE assessment_components SET name = $1, weightage = $2, max_marks = $3 
     WHERE component_id = $4 RETURNING *`,
    [name, weightage, max_marks, componentId]
  );
  return res.rows[0];
};

export const deleteAssessmentComponent = async (componentId) => {
  await db.query(`DELETE FROM assessment_components WHERE component_id = $1`, [componentId]);
  return { success: true };
};

export const getSectionGradebook = async (sectionId) => {
  const [componentsRes, studentsRes, marksRes, instructorRes] = await Promise.all([
    db.query(`SELECT * FROM assessment_components WHERE section_id = $1 ORDER BY created_at ASC`, [sectionId]),
    db.query(`SELECT e.enrollment_id, e.grade, u.name, u.email, st.program, st.semester
              FROM enrollments e
              JOIN students s ON e.student_id = s.student_id
              JOIN users u ON s.user_id = u.user_id
              LEFT JOIN students st ON s.student_id = st.student_id
              WHERE e.section_id = $1 AND e.status = 'enrolled'
              ORDER BY u.name`, [sectionId]),
    db.query(`SELECT sm.* FROM student_marks sm
              JOIN assessment_components ac ON sm.component_id = ac.component_id
              WHERE ac.section_id = $1`, [sectionId]),
    db.query(`SELECT f.department as instructor_department, u.name as instructor_name
              FROM course_sections cs
              JOIN faculty f ON cs.faculty_id = f.faculty_id
              JOIN users u ON f.user_id = u.user_id
              WHERE cs.section_id = $1`, [sectionId])
  ]);


  return {
    components: componentsRes.rows,
    students: studentsRes.rows,
    marks: marksRes.rows,
    instructor: instructorRes.rows[0]
  };
};

export const getGradeScale = async () => {
  const res = await db.query(`SELECT letter_grade as grade, min_score, grade_points as grade_point FROM grade_scale ORDER BY min_score DESC`);
  return res.rows;
};



export const updateStudentMarks = async (enrollmentId, componentId, marksObtained) => {
  // Validate marks against max_marks
  const componentRes = await db.query('SELECT max_marks, section_id FROM assessment_components WHERE component_id = $1', [componentId]);
  if (componentRes.rows.length === 0) throw new Error('Assessment component not found');
  const { max_marks, section_id } = componentRes.rows[0];
  
  if (marksObtained > max_marks) {
    throw new Error(`Marks obtained (${marksObtained}) cannot exceed maximum marks (${max_marks})`);
  }

  const res = await db.query(
    `INSERT INTO student_marks (enrollment_id, component_id, marks_obtained)
     VALUES ($1, $2, $3)
     ON CONFLICT (enrollment_id, component_id)
     DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained, recorded_at = NOW()
     RETURNING *`,
    [enrollmentId, componentId, marksObtained]
  );

  // Trigger GPA and Grade recalculation for this student
  const enrollmentRes = await db.query('SELECT student_id FROM enrollments WHERE enrollment_id = $1', [enrollmentId]);
  if (enrollmentRes.rows.length > 0) {
    await recalculateStudentGrades(enrollmentRes.rows[0].student_id);
  }

  return res.rows[0];
};




// ─────────────────────── ATTENDANCE ───────────────────────
export const getAttendance = async (sectionId, date) => {
  try {
    const res = await db.query(
      `SELECT 
         s.student_id, u.name, u.email,
         a.status as current_status,
         (SELECT COUNT(CASE WHEN status = 'present' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) 
          FROM attendance a2 WHERE a2.student_id = s.student_id AND a2.section_id = e.section_id) as overall_percentage
       FROM enrollments e
       JOIN students s ON e.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       LEFT JOIN attendance a ON a.student_id = s.student_id AND a.section_id = e.section_id AND a.date = $2
       WHERE e.section_id = $1 AND e.status = 'enrolled'
       ORDER BY u.name`, [sectionId, date]
    );

    const instructorRes = await db.query(
      `SELECT f.department as instructor_department, u.name as instructor_name
       FROM course_sections cs
       JOIN faculty f ON cs.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE cs.section_id = $1`, [sectionId]
    );

    return {
      students: res.rows,
      instructor: instructorRes.rows[0]
    };
  } catch (error) {
    console.error("Get attendance error:", error);
    return { students: [], instructor: null };
  }
};


export const submitAttendance = async (sectionId, date, records, userId) => {
  try {
    const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
    const facultyId = facultyRes.rows[0]?.faculty_id;
    if (!facultyId) throw new Error('Faculty record not found');

    // Upsert attendance records for each student
    for (const { studentId, status } of records) {
      await db.query(
        `INSERT INTO attendance (section_id, student_id, date, status, marked_by)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (section_id, student_id, date)
         DO UPDATE SET status = EXCLUDED.status`,
        [sectionId, studentId, date, status, facultyId]
      );
    }

    // --- ATTENDANCE THRESHOLD CHECK ---
    const THRESHOLD = 0.75;
    for (const { studentId } of records) {
       const statsRes = await db.query(`
         SELECT 
           COUNT(CASE WHEN a.status = 'present' THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0) as ratio,
           u.user_id, c.title
         FROM attendance a
         JOIN students s ON a.student_id = s.student_id
         JOIN users u ON s.user_id = u.user_id
         JOIN course_sections cs ON a.section_id = cs.section_id
         JOIN courses c ON cs.course_id = c.course_id
         WHERE a.student_id = $1 AND a.section_id = $2
         GROUP BY u.user_id, c.title
       `, [studentId, sectionId]);

       if (statsRes.rowCount > 0 && statsRes.rows[0].ratio < THRESHOLD) {
         notify({
           userId: statsRes.rows[0].user_id,
           title: 'Low Attendance Alert',
           message: `Your attendance in ${statsRes.rows[0].title} has dropped below the 75% threshold (Current: ${Math.round(statsRes.rows[0].ratio * 100)}%). Please attend classes regularly to avoid penalties.`,
           type: 'system',
           priority: 'high',
           channels: ['in-app', 'email']
         });
       }
    }
    // ------------------------------------

    return { success: true, count: records.length };
  } catch (err) {
    console.error('Attendance submit error:', err);
    return { success: false, error: err.message + (err.detail ? ` (${err.detail})` : '') };
  }
};

// ─────────────────────── ASSIGNMENTS ───────────────────────
export const getSectionAssignments = async (sectionId) => {
  try {
    const res = await db.query(
      `SELECT * FROM assignments WHERE section_id = $1 ORDER BY deadline ASC`, [sectionId]
    );
    return res.rows;
  } catch {
    return [
      { assignment_id: '1', title: 'Lab 1: Linked Lists', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), max_marks: 20, submission_type: 'file' },
      { assignment_id: '2', title: 'Mid-term Project', deadline: new Date(Date.now() + 14 * 86400000).toISOString(), max_marks: 50, submission_type: 'file' },
    ];
  }
};

export const getAssignmentById = async (id) => {
  const res = await db.query(
    `SELECT a.*, c.title as course_name, c.course_code, cs.section_name 
     FROM assignments a
     JOIN course_sections cs ON a.section_id = cs.section_id
     JOIN courses c ON cs.course_id = c.course_id
     WHERE a.assignment_id = $1`,
    [id]
  );
  return res.rows[0];
};

export const createAssignment = async ({ sectionId, title, description, deadline, max_marks, submission_type, userId }) => {
  try {
    const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
    const facultyId = facultyRes.rows[0]?.faculty_id;
    if (!facultyId) throw new Error('Faculty record not found');

    console.log('Creating assignment with data:', { sectionId, title, deadline, facultyId });
    const res = await db.query(
      `INSERT INTO assignments (section_id, title, description, deadline, max_marks, submission_type, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [sectionId, title, description, deadline, max_marks, submission_type, facultyId]
    );
    console.log('Assignment created successfully:', res.rows[0]);
    const assignment = res.rows[0];

    // Notify all Students in section
    const studentsRes = await db.query(`
      SELECT u.user_id, c.title as course_title 
      FROM enrollments e 
      JOIN students s ON e.student_id = s.student_id 
      JOIN users u ON s.user_id = u.user_id 
      JOIN course_sections cs ON e.section_id = cs.section_id
      JOIN courses c ON cs.course_id = c.course_id
      WHERE e.section_id = $1 AND e.status = 'enrolled'
    `, [sectionId]);

    if (studentsRes.rowCount > 0) {
      const courseTitle = studentsRes.rows[0].course_title;
      for (const student of studentsRes.rows) {
        notify({
          userId: student.user_id,
          title: 'New Assignment Posted',
          message: `A new assignment "${title}" has been posted for ${courseTitle}. Deadline: ${new Date(deadline).toLocaleString()}`,
          type: 'assignment',
          priority: 'medium',
          channels: ['in-app', 'email']
        });
      }
    }

    return assignment;
  } catch (err) {
    throw new Error(err.message);
  }
};

// ─────────────────────── COURSE APPROVALS ───────────────────────
export const submitCourseRequest = async (userId, { type, targetId, data }) => {
  try {
    // 1. Check for teacher schedule conflict if schedule data is provided
    if ((type === 'COURSE_ADD' || type === 'COURSE_EDIT') && data.day_of_week && data.start_time && data.end_time) {
      if (data.start_time >= data.end_time) {
        throw new Error('Invalid Time: Start time must be before end time.');
      }
      console.log('Checking faculty conflict for submission. user_id:', userId, 'type:', type);
      const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
      const facultyId = facultyRes.rows[0]?.faculty_id;
      console.log('Submission conflict check - facultyId:', facultyId);
      
      if (facultyId) {
        // We check for overlaps with existing sections assigned to this teacher
        const proposedDays = normalizeDays(data.day_of_week);
        const conflictRes = await db.query(`
          SELECT cs.section_name, c.title, cs.day_of_week
          FROM course_sections cs
          JOIN courses c ON cs.course_id = c.course_id
          WHERE cs.faculty_id = $1
          AND ($3::TEXT IS NULL OR cs.section_id::TEXT != $3::TEXT)
          AND (
            (cs.start_time::TIME, cs.end_time::TIME) OVERLAPS ($2::TIME, $4::TIME)
          )
        `, [facultyId, data.start_time, data.section_id || null, data.end_time]);

        // Filter by normalized days in JS for maximum reliability
        console.log('Conflict query returned rows:', conflictRes.rows.length);
        const conflict = conflictRes.rows.find(row => {
          const existingDays = normalizeDays(row.day_of_week);
          const intersects = existingDays.some(d => proposedDays.includes(d));
          console.log(`Checking overlap with ${row.title} on ${row.day_of_week}: ${intersects}`);
          return intersects;
        });

        if (conflict) {
          throw new Error(`Schedule Conflict: You already have a class ("${conflict.title} - ${conflict.section_name}") scheduled during this time on ${conflict.day_of_week}. Please choose a different slot.`);
        }
      }
    }

    const res = await db.query(
      `INSERT INTO approval_requests (requester_id, request_type, target_id, request_data)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, type, targetId, data]
    );
    
    // Notify Admin (optional, but good for UX)
    // We can fetch all admins and notify them or just rely on the dashboard
    
    return res.rows[0];
  } catch (err) {
    console.error('Submit Course Request Error:', err);
    throw new Error('Failed to submit request: ' + err.message);
  }
};

export const getMyRequests = async (userId) => {
  try {
    const res = await db.query(
      `SELECT * FROM approval_requests WHERE requester_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows;
  } catch (err) {
    throw new Error('Failed to fetch requests');
  }
};

// ─────────────────────── SUBMISSIONS & GRADING ───────────────────────
export const getAssignmentSubmissions = async (assignmentId) => {
  const res = await db.query(`
    SELECT s.*, u.name as student_name, u.email as student_email
    FROM submissions s
    JOIN students st ON s.student_id = st.student_id
    JOIN users u ON st.user_id = u.user_id
    WHERE s.assignment_id = $1
    ORDER BY s.submitted_at DESC
  `, [assignmentId]);
  return res.rows;
};

export const gradeSubmission = async (submissionId, marks, feedback, userId) => {
  const facultyRes = await db.query(`SELECT faculty_id FROM faculty WHERE user_id = $1`, [userId]);
  const facultyId = facultyRes.rows[0]?.faculty_id;
  
  // Validate marks
  const assignmentRes = await db.query(`
    SELECT a.max_marks FROM assignments a
    JOIN submissions s ON s.assignment_id = a.assignment_id
    WHERE s.submission_id = $1
  `, [submissionId]);
  
  if (assignmentRes.rows.length > 0) {
    if (marks > assignmentRes.rows[0].max_marks) {
      throw new Error(`Marks obtained (${marks}) cannot exceed maximum marks (${assignmentRes.rows[0].max_marks})`);
    }
  }

  const res = await db.query(`
    UPDATE submissions 
    SET marks_obtained = $1, feedback = $2, graded_by = $3, graded_at = NOW()
    WHERE submission_id = $4
    RETURNING *
  `, [marks, feedback, facultyId, submissionId]);

  
  const submission = res.rows[0];
  if (submission) {
    // Notify student
    const studentUserRes = await db.query(`
      SELECT u.user_id, a.title as assignment_title
      FROM submissions s
      JOIN students st ON s.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      JOIN assignments a ON s.assignment_id = a.assignment_id
      WHERE s.submission_id = $1
    `, [submissionId]);
    
    if (studentUserRes.rowCount > 0) {
      notify({
        userId: studentUserRes.rows[0].user_id,
        title: 'Assignment Graded',
        message: `Your submission for "${studentUserRes.rows[0].assignment_title}" has been graded. Marks: ${marks}.`,
        type: 'grade',
        priority: 'medium'
      });
    }
  }
  return submission;
};

export const deleteAssignment = async (id) => {
  await db.query(`DELETE FROM submissions WHERE assignment_id = $1`, [id]);
  await db.query(`DELETE FROM assignments WHERE assignment_id = $1`, [id]);
  return { success: true };
};

export const createEvaluationForm = async (sectionId, title, description, questions) => {
  const res = await db.query(`
    INSERT INTO evaluation_forms (section_id, title, description, questions)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [sectionId, title, description, JSON.stringify(questions)]);
  return res.rows[0];
};

export const getEvaluationStats = async (sectionId) => {
  try {
    const res = await db.query(`
      SELECT 
        f.form_id,
        f.title,
        f.created_at,
        COUNT(DISTINCT r.response_id) as total_responses,
        (
          SELECT AVG(CAST(value AS NUMERIC))
          FROM evaluation_responses er, 
               jsonb_each_text(CASE WHEN jsonb_typeof(er.answers) = 'object' THEN er.answers ELSE '{}'::jsonb END) AS pair(key, value)
          WHERE er.form_id = f.form_id
          AND value ~ '^[0-9.]+$'
        ) as average_score
      FROM evaluation_forms f
      LEFT JOIN evaluation_responses r ON f.form_id = r.form_id
      WHERE f.section_id = $1
      GROUP BY f.form_id, f.title, f.created_at
      ORDER BY f.created_at DESC
    `, [sectionId]);
    return res.rows;
  } catch (err) {
    console.error("Database error in getEvaluationStats:", err);
    // If table doesn't exist or query fails, return empty array to avoid crashing UI
    return [];
  }
};

export const getEvaluationResponses = async (formId) => {
  const res = await db.query(`
    SELECT r.*, u.name as student_name 
    FROM evaluation_responses r 
    JOIN students s ON r.student_id = s.student_id 
    JOIN users u ON s.user_id = u.user_id 
    WHERE r.form_id = $1 
    ORDER BY r.submitted_at DESC
  `, [formId]);
  return res.rows;
};

// ─────────────────────── ANNOUNCEMENTS ───────────────────────
export const getAnnouncements = async (userId) => {
  const res = await db.query(`
    SELECT a.*, u.name as author_name 
    FROM announcements a
    LEFT JOIN users u ON a.created_by = u.user_id
    WHERE a.target_role IN ('all', 'faculty')
       OR a.target_user_id = $1
       OR a.created_by = $1
    ORDER BY a.is_pinned DESC, a.created_at DESC
  `, [userId]);
  return res.rows;
};

export const createAnnouncement = async (data, userId) => {
  try {
    const { title, body, category, target_role, target_user_id, expiry_date, is_pinned, send_email } = data;
    
    console.log('Creating announcement:', { title, target_role, userId });

    const res = await db.query(`
      INSERT INTO announcements (title, body, category, target_role, target_user_id, expiry_date, is_pinned, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [title, body, category, target_role, target_user_id || null, expiry_date || null, is_pinned || false, userId]);
    
    const announcement = res.rows[0];

    // Handle Notifications/Emails if requested or if individual
    if (send_email || target_role === 'individual') {
      let recipients = [];
      
      if (target_role === 'individual' && target_user_id) {
        recipients.push(target_user_id);
      } else if (target_role === 'student' || target_role === 'all') {
        // Find all students enrolled in this faculty's sections
        const studentsRes = await db.query(`
          SELECT DISTINCT s.user_id
          FROM enrollments e
          JOIN course_sections cs ON e.section_id = cs.section_id
          JOIN students s ON e.student_id = s.student_id
          JOIN faculty f ON cs.faculty_id = f.faculty_id
          WHERE f.user_id = $1 AND e.status = 'enrolled'
        `, [userId]);
        recipients = studentsRes.rows.map(r => r.user_id);
      }

      console.log(`Sending notifications to ${recipients.length} recipients`);

      // Trigger notifications for each recipient
      for (const targetUid of recipients) {
        try {
          await notify({
            userId: targetUid,
            title: `Announcement: ${title}`,
            message: body,
            type: 'system',
            priority: is_pinned ? 'high' : 'medium',
            relatedId: announcement.announcement_id,
            channels: send_email ? ['in-app', 'email'] : ['in-app']
          });
        } catch (notifErr) {
          console.error(`Failed to notify user ${targetUid}:`, notifErr.message);
        }
      }
    }

    return announcement;
  } catch (error) {
    console.error('createAnnouncement Service Error:', error);
    throw error;
  }
};

export const updateAnnouncement = async (id, data, userId) => {
  const { title, body, category, target_role, target_user_id, expiry_date, is_pinned } = data;
  const res = await db.query(`
    UPDATE announcements 
    SET title = $1, body = $2, category = $3, target_role = $4, target_user_id = $5, expiry_date = $6, is_pinned = $7
    WHERE announcement_id = $8 AND created_by = $9
    RETURNING *
  `, [
    title, body, category, target_role, 
    target_user_id || null, 
    expiry_date || null, 
    is_pinned || false, 
    id, userId
  ]);
  return res.rows[0];
};

export const deleteAnnouncement = async (id, userId) => {
  const res = await db.query(
    `DELETE FROM announcements WHERE announcement_id = $1 AND created_by = $2 RETURNING *`,
    [id, userId]
  );
  return res.rows[0];
};

// ─────────────────────── NOTIFICATIONS ───────────────────────
export const getNotifications = async (userId, { isRead, limit = 50 }) => {
  let query = `SELECT * FROM notifications WHERE user_id = $1`;
  const params = [userId];

  if (isRead !== null) {
    query += ` AND is_read = $2`;
    params.push(isRead);
  }

  query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
  params.push(limit);

  const res = await db.query(query, params);
  return res.rows;
};

export const markNotificationRead = async (id, userId) => {
  await db.query(
    `UPDATE notifications SET is_read = true WHERE notification_id = $1 AND user_id = $2`,
    [id, userId]
  );
  return { success: true };
};


export const getSubmissionById = async (submissionId) => {
  const res = await db.query(
    'SELECT submission_id, file_url FROM submissions WHERE submission_id = $1',
    [submissionId]
  );
  return res.rows[0];
};
