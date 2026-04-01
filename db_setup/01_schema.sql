-- =====================================================
-- SCHOOL MANAGEMENT SYSTEM - DATABASE SCHEMA
-- The Bridge Foundation
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CAMPUSES (Created first, without principal_id FK)
-- =====================================================

CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    principal_id UUID, -- We will link this to users later
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    established_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. USERS & AUTHENTICATION
-- =====================================================

-- Users table (staff, teachers, admins, super admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'campus_admin', 'teacher', 'staff')),
    campus_id UUID REFERENCES campuses(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    phone VARCHAR(20),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP
);

-- Link Campuses back to Users now that Users exists
ALTER TABLE campuses ADD CONSTRAINT fk_campus_principal FOREIGN KEY (principal_id) REFERENCES users(id);

-- Registration requests (for tracking approval workflow)
CREATE TABLE registration_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    campus_id UUID REFERENCES campuses(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    rejection_reason TEXT
);

-- (Keep your grades, sections, students, etc. exactly as they were below this point...)

-- Grades/Classes structure
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Grade 1", "Grade 2"
    code VARCHAR(50) NOT NULL, -- e.g., "G1", "G2"
    display_order INTEGER NOT NULL,
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2025-2026"
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campus_id, code, academic_year)
);

-- Sections within grades (e.g., Section A, Section B)
CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g., "Section A"
    code VARCHAR(50) NOT NULL, -- e.g., "A"
    class_teacher_id UUID REFERENCES users(id),
    max_capacity INTEGER DEFAULT 40,
    current_strength INTEGER DEFAULT 0,
    room_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(grade_id, code)
);

-- =====================================================
-- STUDENTS
-- =====================================================

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    current_grade_id UUID REFERENCES grades(id),
    current_section_id UUID REFERENCES sections(id),
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10),
    photo_url TEXT,
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Guardian Information
    guardian_name VARCHAR(255),
    guardian_relationship VARCHAR(50),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(255),
    guardian_occupation VARCHAR(100),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Academic Information
    admission_date DATE NOT NULL,
    previous_school VARCHAR(255),
    previous_grade VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'graduated', 'withdrawn', 'suspended')),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Student enrollment history (for tracking grade transfers)
CREATE TABLE student_enrollment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id),
    section_id UUID REFERENCES sections(id),
    academic_year VARCHAR(20) NOT NULL,
    enrollment_date DATE NOT NULL,
    exit_date DATE,
    status VARCHAR(50) CHECK (status IN ('active', 'completed', 'transferred')),
    transferred_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STAFF & HR
-- =====================================================

CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Other')),
    blood_group VARCHAR(10),
    photo_url TEXT,
    
    -- Contact Information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(50),
    
    -- Employment Details
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    joining_date DATE NOT NULL,
    employment_type VARCHAR(50) CHECK (employment_type IN ('Full-time', 'Part-time', 'Contract', 'Temporary')),
    salary DECIMAL(12, 2),
    
    -- Qualifications
    highest_qualification VARCHAR(100),
    specialization VARCHAR(100),
    experience_years INTEGER,
    
    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'on_leave', 'suspended', 'terminated', 'resigned')),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- =====================================================
-- SYLLABUS & CURRICULUM
-- =====================================================

-- Courses/Subjects
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    teacher_id UUID REFERENCES users(id),
    credit_hours INTEGER,
    is_compulsory BOOLEAN DEFAULT true,
    display_order INTEGER,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campus_id, grade_id, code)
);

-- Chapters within courses
CREATE TABLE chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    estimated_hours INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Topics within chapters
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL,
    learning_objectives TEXT[],
    resources_urls TEXT[],
    estimated_hours INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Syllabus progress tracking
CREATE TABLE syllabus_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    completion_date DATE,
    taught_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, section_id, topic_id)
);

-- =====================================================
-- ATTENDANCE
-- =====================================================

CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id),
    section_id UUID REFERENCES sections(id),
    attendance_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'half_day')),
    check_in_time TIME,
    check_out_time TIME,
    remarks TEXT,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, attendance_date)
);

-- Attendance summary (for quick statistics)
CREATE TABLE attendance_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id),
    section_id UUID REFERENCES sections(id),
    month_year VARCHAR(7) NOT NULL, -- Format: "2026-03"
    total_days INTEGER DEFAULT 0,
    present_days INTEGER DEFAULT 0,
    absent_days INTEGER DEFAULT 0,
    late_days INTEGER DEFAULT 0,
    excused_days INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, month_year)
);

-- =====================================================
-- EXAMS & RESULTS
-- =====================================================

-- Exam definitions
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    exam_type VARCHAR(50) NOT NULL CHECK (exam_type IN ('Mid-term', 'Final', 'Quiz', 'Assignment', 'Project', 'Unit Test')),
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campus_id, code, academic_year)
);

-- Exam schedules (individual exam papers)
CREATE TABLE exam_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_marks INTEGER NOT NULL,
    passing_marks INTEGER NOT NULL,
    room_number VARCHAR(50),
    invigilator_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student exam results
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_schedule_id UUID REFERENCES exam_schedules(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(6, 2),
    max_marks INTEGER NOT NULL,
    grade VARCHAR(10), -- A+, A, B+, B, C, D, F
    remarks TEXT,
    is_absent BOOLEAN DEFAULT false,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_schedule_id, student_id)
);

-- Report cards (consolidated results)
CREATE TABLE report_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id),
    section_id UUID REFERENCES sections(id),
    total_marks_obtained DECIMAL(8, 2),
    total_max_marks INTEGER,
    percentage DECIMAL(5, 2),
    overall_grade VARCHAR(10),
    rank_in_class INTEGER,
    rank_in_grade INTEGER,
    attendance_percentage DECIMAL(5, 2),
    conduct_grade VARCHAR(10),
    remarks TEXT,
    generated_by UUID REFERENCES users(id),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, exam_id)
);

-- =====================================================
-- AUDIT LOGS
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    campus_id UUID REFERENCES campuses(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL, -- student, staff, exam, attendance, etc.
    entity_id UUID,
    details JSONB, -- Store detailed information about the action
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SETTINGS & CONFIGURATIONS
-- =====================================================

CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id), -- NULL for global settings
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(50) CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_editable BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campus_id, setting_key)
);

-- Grading scales
CREATE TABLE grading_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id UUID REFERENCES campuses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    min_percentage DECIMAL(5, 2) NOT NULL,
    max_percentage DECIMAL(5, 2) NOT NULL,
    grade_point DECIMAL(3, 2),
    description TEXT,
    display_order INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_campus ON users(campus_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Students indexes
CREATE INDEX idx_students_campus ON students(campus_id);
CREATE INDEX idx_students_grade ON students(current_grade_id);
CREATE INDEX idx_students_section ON students(current_section_id);
CREATE INDEX idx_students_admission ON students(admission_number);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_students_name ON students(first_name, last_name);

-- Attendance indexes
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_campus ON attendance(campus_id);
CREATE INDEX idx_attendance_section ON attendance(section_id);
CREATE INDEX idx_attendance_composite ON attendance(student_id, attendance_date);

-- Exam results indexes
CREATE INDEX idx_exam_results_student ON exam_results(student_id);
CREATE INDEX idx_exam_results_schedule ON exam_results(exam_schedule_id);
CREATE INDEX idx_exam_schedules_exam ON exam_schedules(exam_id);
CREATE INDEX idx_exam_schedules_grade ON exam_schedules(grade_id);

-- Audit logs indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_campus ON audit_logs(campus_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- Syllabus indexes
CREATE INDEX idx_courses_grade ON courses(grade_id);
CREATE INDEX idx_chapters_course ON chapters(course_id);
CREATE INDEX idx_topics_chapter ON topics(chapter_id);
CREATE INDEX idx_syllabus_progress_course ON syllabus_progress(course_id);
CREATE INDEX idx_syllabus_progress_section ON syllabus_progress(section_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_campuses_updated_at BEFORE UPDATE ON campuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_results_updated_at BEFORE UPDATE ON exam_results FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Student full details view
CREATE VIEW vw_student_details AS
SELECT 
    s.*,
    g.name as grade_name,
    g.code as grade_code,
    sec.name as section_name,
    c.name as campus_name,
    c.code as campus_code,
    CONCAT(s.first_name, ' ', s.last_name) as full_name,
    EXTRACT(YEAR FROM AGE(s.date_of_birth)) as age
FROM students s
LEFT JOIN grades g ON s.current_grade_id = g.id
LEFT JOIN sections sec ON s.current_section_id = sec.id
LEFT JOIN campuses c ON s.campus_id = c.id;

-- Staff full details view
CREATE VIEW vw_staff_details AS
SELECT 
    st.*,
    c.name as campus_name,
    c.code as campus_code,
    u.email as user_email,
    u.role as user_role,
    CONCAT(st.first_name, ' ', st.last_name) as full_name
FROM staff st
LEFT JOIN campuses c ON st.campus_id = c.id
LEFT JOIN users u ON st.user_id = u.id;

-- Current attendance statistics
CREATE VIEW vw_current_attendance_stats AS
SELECT 
    s.campus_id,
    s.current_grade_id,
    s.current_section_id,
    a.attendance_date,
    COUNT(*) as total_students,
    SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_count,
    SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
    SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as late_count,
    ROUND(SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*) * 100, 2) as attendance_percentage
FROM attendance a
JOIN students s ON a.student_id = s.id
GROUP BY s.campus_id, s.current_grade_id, s.current_section_id, a.attendance_date;
