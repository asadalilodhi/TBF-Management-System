DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS exam_definitions;
DROP TABLE IF EXISTS attendance_log;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS class_subjects;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS academic_years;
DROP TABLE IF EXISTS campuses;

-- ==========================================
-- ACADEMIC STRUCTURE (The "Builder")
-- ==========================================
CREATE TABLE campuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL, -- e.g., "2025-2026"
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL, -- e.g., "Grade 5"
    section VARCHAR(10),       -- e.g., "A"
    campus_id INT REFERENCES campuses(id)
);

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20)
);

-- Linker: Which subjects are taught in which class?
CREATE TABLE class_subjects (
    id SERIAL PRIMARY KEY,
    class_id INT REFERENCES classes(id),
    subject_id INT REFERENCES subjects(id),
    UNIQUE(class_id, subject_id)
);

-- ==========================================
-- USERS & SECURITY (Bcrypt Hashing)
-- ==========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('SuperAdmin', 'CampusAdmin', 'Teacher', 'Viewer')),
    campus_id INT REFERENCES campuses(id), -- Nullable for SuperAdmin
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- OPERATIONAL DATA
-- ==========================================
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    gr_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    father_name VARCHAR(100),
    current_class_id INT REFERENCES classes(id),
    admission_date DATE DEFAULT CURRENT_DATE,
    fee_status VARCHAR(20) DEFAULT 'Scholarship',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE attendance_log (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE,
    student_id INT REFERENCES students(id),
    status VARCHAR(10) CHECK (status IN ('P', 'A', 'L')),
    marked_by INT REFERENCES users(id)
);

-- ==========================================
-- EXAMS & GRADING (Dynamic)
-- ==========================================
CREATE TABLE exam_definitions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- e.g., "Midterm 2026"
    academic_year_id INT REFERENCES academic_years(id),
    class_subject_id INT REFERENCES class_subjects(id),
    max_marks DECIMAL(5,2) DEFAULT 100
);

CREATE TABLE exam_results (
    id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(id),
    exam_definition_id INT REFERENCES exam_definitions(id),
    marks_obtained DECIMAL(5,2),
    grade VARCHAR(2) -- A, B, C, F
);

-- ==========================================
-- SEED DATA (The "Test Set")
-- ==========================================

-- Setup Campuses & Year
INSERT INTO campuses (name, address) VALUES 
('North Campus', '123 Main St, Zone A'), 
('South Campus', '456 Side Rd, Zone B');

INSERT INTO academic_years (name, start_date, end_date, is_active) VALUES 
('2025-2026', '2025-08-01', '2026-05-30', TRUE);

-- Setup Classes (Modularity Test)
-- North Campus Classes
INSERT INTO classes (name, section, campus_id) VALUES 
('Grade 1', 'Pink', 1),
('Grade 5', 'Blue', 1);
-- South Campus Class
INSERT INTO classes (name, section, campus_id) VALUES 
('Grade 10', 'Red', 2);

-- Setup Subjects
INSERT INTO subjects (name, code) VALUES 
('Mathematics', 'MATH'), ('English', 'ENG'), ('Urdu', 'URDU'), 
('Science', 'SCI'), ('Computer Science', 'CS');

-- Link Subjects to Classes (The "Builder" Logic)
-- Grade 1 studies Math & English
INSERT INTO class_subjects (class_id, subject_id) VALUES (1, 1), (1, 2); 
-- Grade 5 studies Math, English, Science
INSERT INTO class_subjects (class_id, subject_id) VALUES (2, 1), (2, 2), (2, 4);
-- Grade 10 studies Math, Computer
INSERT INTO class_subjects (class_id, subject_id) VALUES (3, 1), (3, 5);

-- Create Users (Password is 'password123' for ALL)
-- Hash: $2b$10$X7u... is the bcrypt hash for 'password123'
INSERT INTO users (username, password_hash, role, campus_id) VALUES 
('admin', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'SuperAdmin', NULL),
('north_manager', '$2b$10$X7uV3g.Z.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'CampusAdmin', 1),
('teacher_grade5', '$2b$10$X7uV3g.Z.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1.1', 'Teacher', 1);

-- Create Students (10 students)
INSERT INTO students (gr_number, full_name, father_name, current_class_id) VALUES 
('GR-1001', 'Ali Khan', 'Ahmed Khan', 1),       -- Grade 1
('GR-1002', 'Sara Bibi', 'Raza Ali', 1),        -- Grade 1
('GR-1003', 'Bilal Ahmed', 'Noman Ahmed', 2),   -- Grade 5
('GR-1004', 'Zainab Fatima', 'Ali Hassan', 2),  -- Grade 5
('GR-1005', 'Usman Ghani', 'Umar Ghani', 3);    -- Grade 10

-- Create an Exam ("Midterm")
-- We link it to Grade 5 Math (Subject ID 1 in Class ID 2)
INSERT INTO exam_definitions (name, academic_year_id, class_subject_id, max_marks) 
VALUES ('Midterm 2026', 1, 3, 50.00); -- Class_Subject_ID 3 is Grade 5 Math

-- Enter Marks
INSERT INTO exam_results (student_id, exam_definition_id, marks_obtained, grade) VALUES 
(3, 1, 45.0, 'A'), -- Bilal got 45/50
(4, 1, 22.0, 'C'); -- Zainab got 22/50