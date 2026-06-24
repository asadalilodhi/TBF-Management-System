-- =====================================================
-- SCHOOL MANAGEMENT SYSTEM - SEED DATA
-- The Bridge Foundation - Sample Data
-- =====================================================

-- =====================================================
-- 1. CAMPUSES
-- =====================================================

INSERT INTO campuses (id, name, code, address, city, state, postal_code, phone, email, status, established_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Bridge Foundation North Campus', 'BF-NC', '123 Education Street', 'Mumbai', 'Maharashtra', '400001', '+91-22-12345678', '@bridgefoundation.org', 'active', '2015-01-15'),
('550e8400-e29b-41d4-a716-446655440002', 'Bridge Foundation South Campus', 'BF-SC', '456 Learning Avenue', 'Delhi', 'Delhi', '110001', '+91-11-87654321', 'south@bridgefoundation.org', 'active', '2017-06-20');

-- =====================================================
-- 2. USERS (Super Admin, Campus Admins, Teachers, Staff)
-- =====================================================

-- Password hash for 'password123' (in production, use proper bcrypt)
-- For demo purposes, using a placeholder hash

-- Super Admin
INSERT INTO users (id, email, password_hash, full_name, role, campus_id, status, phone, created_at, approved_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'superadmin@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Dr. Rajesh Kumar', 'super_admin', NULL, 'approved', '+91-98765-43210', '2024-01-01 10:00:00', '2024-01-01 10:00:00');

-- Campus Admins
INSERT INTO users (id, email, password_hash, full_name, role, campus_id, status, phone, created_at, approved_by, approved_at) VALUES
('650e8400-e29b-41d4-a716-446655440002', 'admin.north@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mrs. Priya Sharma', 'campus_admin', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98765-11111', '2024-01-05 09:00:00', '650e8400-e29b-41d4-a716-446655440001', '2024-01-05 10:00:00'),
('650e8400-e29b-41d4-a716-446655440003', 'admin.south@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mr. Arjun Patel', 'campus_admin', '550e8400-e29b-41d4-a716-446655440002', 'approved', '+91-98765-22222', '2024-01-05 09:00:00', '650e8400-e29b-41d4-a716-446655440001', '2024-01-05 10:00:00');

-- Teachers - Central Campus
INSERT INTO users (id, email, password_hash, full_name, role, campus_id, status, phone, created_at, approved_by, approved_at) VALUES
('650e8400-e29b-41d4-a716-446655440010', 'teacher.math@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mr. Vikram Singh', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98111-11111', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-10 10:00:00'),
('650e8400-e29b-41d4-a716-446655440011', 'teacher.science@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mrs. Anjali Desai', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98111-22222', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-10 10:00:00'),
('650e8400-e29b-41d4-a716-446655440012', 'teacher.english@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Ms. Neha Kapoor', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98111-33333', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-10 10:00:00'),
('650e8400-e29b-41d4-a716-446655440013', 'teacher.social@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mr. Ravi Kumar', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98111-44444', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-10 10:00:00'),
('650e8400-e29b-41d4-a716-446655440014', 'teacher.hindi@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mrs. Kavita Verma', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98111-55555', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-10 10:00:00'),
('650e8400-e29b-41d4-a716-446655440015', 'teacher.computer@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mr. Amit Joshi', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98111-66666', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-10 10:00:00');

-- Teachers -  Campus
INSERT INTO users (id, email, password_hash, full_name, role, campus_id, status, phone, created_at, approved_by, approved_at) VALUES
('650e8400-e29b-41d4-a716-446655440020', 'teacher.math.north@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mr. Rahul Mehta', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98222-11111', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440003', '2024-01-10 10:00:00'),
('650e8400-e29b-41d4-a716-446655440021', 'teacher.science.south@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mrs. Sunita Agarwal', 'teacher', '550e8400-e29b-41d4-a716-446655440002', 'approved', '+91-98222-22222', '2024-01-10 09:00:00', '650e8400-e29b-41d4-a716-446655440003', '2024-01-10 10:00:00');

-- Staff Members
INSERT INTO users (id, email, password_hash, full_name, role, campus_id, status, phone, created_at, approved_by, approved_at) VALUES
('650e8400-e29b-41d4-a716-446655440030', 'staff.admin@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mr. Suresh Nair', 'staff', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98333-11111', '2024-01-15 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-15 10:00:00'),
('650e8400-e29b-41d4-a716-446655440031', 'staff.accountant@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Ms. Meena Iyer', 'staff', '550e8400-e29b-41d4-a716-446655440001', 'approved', '+91-98333-22222', '2024-01-15 09:00:00', '650e8400-e29b-41d4-a716-446655440002', '2024-01-15 10:00:00');

-- Pending Users (for registration approval workflow)
INSERT INTO users (id, email, password_hash, full_name, role, campus_id, status, phone, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440040', 'pending.teacher@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mr. Karan Shah', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'pending', '+91-98444-11111', '2026-03-15 10:00:00'),
('650e8400-e29b-41d4-a716-446655440041', 'pending.staff@bridgefoundation.org', '$2b$10$JtR8G3i.2RaTBXU8o7sGQeXHXdlO9hMotTz58d.sabfoS1xsOFdLO', 'Mrs. Pooja Gupta', 'staff', '550e8400-e29b-41d4-a716-446655440002', 'pending', '+91-98444-22222', '2026-03-16 11:00:00');

-- =====================================================
-- 3. REGISTRATION REQUESTS
-- =====================================================

INSERT INTO registration_requests (id, email, full_name, role, campus_id, status, request_date) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'pending.teacher@bridgefoundation.org', 'Mr. Karan Shah', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'pending', '2026-03-15 10:00:00'),
('750e8400-e29b-41d4-a716-446655440002', 'pending.staff@bridgefoundation.org', 'Mrs. Pooja Gupta', 'staff', '550e8400-e29b-41d4-a716-446655440002', 'pending', '2026-03-16 11:00:00'),
('750e8400-e29b-41d4-a716-446655440003', 'approved.teacher@bridgefoundation.org', 'Mr. Deepak Rao', 'teacher', '550e8400-e29b-41d4-a716-446655440001', 'approved', '2026-03-10 09:00:00');

-- =====================================================
-- 4. GRADES & SECTIONS
-- =====================================================

-- Central Campus Grades
INSERT INTO grades (id, campus_id, name, code, display_order, academic_year, status) VALUES
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Grade 1', 'G1', 1, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Grade 2', 'G2', 2, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Grade 3', 'G3', 3, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Grade 4', 'G4', 4, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Grade 5', 'G5', 5, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Grade 6', 'G6', 6, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'Grade 7', 'G7', 7, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Grade 8', 'G8', 8, '2025-2026', 'active');

--  Campus Grades
INSERT INTO grades (id, campus_id, name, code, display_order, academic_year, status) VALUES
('850e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'Grade 1', 'G1', 1, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Grade 2', 'G2', 2, '2025-2026', 'active'),
('850e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'Grade 3', 'G3', 3, '2025-2026', 'active');

-- Sections for Central Campus Grade 1
INSERT INTO sections (id, grade_id, name, code, class_teacher_id, max_capacity, current_strength, room_number) VALUES
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Section A', 'A', '650e8400-e29b-41d4-a716-446655440010', 40, 35, 'Room 101'),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', 'Section B', 'B', '650e8400-e29b-41d4-a716-446655440011', 40, 38, 'Room 102');

-- Sections for Central Campus Grade 2
INSERT INTO sections (id, grade_id, name, code, class_teacher_id, max_capacity, current_strength, room_number) VALUES
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440002', 'Section A', 'A', '650e8400-e29b-41d4-a716-446655440012', 40, 36, 'Room 201'),
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440002', 'Section B', 'B', '650e8400-e29b-41d4-a716-446655440013', 40, 34, 'Room 202');

-- Sections for Central Campus Grade 3
INSERT INTO sections (id, grade_id, name, code, class_teacher_id, max_capacity, current_strength, room_number) VALUES
('950e8400-e29b-41d4-a716-446655440005', '850e8400-e29b-41d4-a716-446655440003', 'Section A', 'A', '650e8400-e29b-41d4-a716-446655440014', 40, 32, 'Room 301');

-- =====================================================
-- 5. STUDENTS
-- =====================================================

-- Grade 1 Section A Students (Central Campus)
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, email, phone, address, city, state, postal_code, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-001', 'Aarav', 'Sharma', '2019-04-15', 'Male', 'B+', NULL, NULL, '123 Park Street', 'Mumbai', 'Maharashtra', '400001', 'Mr. Rajesh Sharma', 'Father', '+91-98100-11111', 'rajesh.sharma@email.com', 'Mrs. Sunita Sharma', '+91-98100-22222', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-002', 'Aisha', 'Khan', '2019-06-20', 'Female', 'O+', NULL, NULL, '456 Garden Road', 'Mumbai', 'Maharashtra', '400002', 'Mr. Arif Khan', 'Father', '+91-98100-33333', 'arif.khan@email.com', 'Mrs. Fatima Khan', '+91-98100-44444', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-003', 'Rohan', 'Patel', '2019-03-10', 'Male', 'A+', NULL, NULL, '789 Lake View', 'Mumbai', 'Maharashtra', '400003', 'Mr. Kiran Patel', 'Father', '+91-98100-55555', 'kiran.patel@email.com', 'Mrs. Meera Patel', '+91-98100-66666', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-004', 'Diya', 'Singh', '2019-05-25', 'Female', 'AB+', NULL, NULL, '321 Hill Station', 'Mumbai', 'Maharashtra', '400004', 'Mr. Vikram Singh', 'Father', '+91-98100-77777', 'vikram.singh@email.com', 'Mrs. Priya Singh', '+91-98100-88888', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-005', 'Arjun', 'Verma', '2019-07-08', 'Male', 'O-', NULL, NULL, '654 River Side', 'Mumbai', 'Maharashtra', '400005', 'Mr. Sunil Verma', 'Father', '+91-98100-99999', 'sunil.verma@email.com', 'Mrs. Anjali Verma', '+91-98100-00000', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002');

-- More Grade 1 Section A students (30 more to make 35 total)
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-006', 'Saanvi', 'Reddy', '2019-02-14', 'Female', 'B+', 'Mr. Krishna Reddy', 'Father', '+91-98101-11111', 'krishna.reddy@email.com', 'Mrs. Lakshmi Reddy', '+91-98101-22222', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-007', 'Vihaan', 'Gupta', '2019-08-30', 'Male', 'A-', 'Mr. Amit Gupta', 'Father', '+91-98101-33333', 'amit.gupta@email.com', 'Mrs. Neha Gupta', '+91-98101-44444', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-008', 'Ananya', 'Joshi', '2019-01-12', 'Female', 'O+', 'Mr. Rahul Joshi', 'Father', '+91-98101-55555', 'rahul.joshi@email.com', 'Mrs. Kavita Joshi', '+91-98101-66666', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-009', 'Advait', 'Nair', '2019-09-05', 'Male', 'B-', 'Mr. Suresh Nair', 'Father', '+91-98101-77777', 'suresh.nair@email.com', 'Mrs. Divya Nair', '+91-98101-88888', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'BF-CC-2024-010', 'Ishaan', 'Mehta', '2019-04-22', 'Male', 'AB+', 'Mr. Anil Mehta', 'Father', '+91-98101-99999', 'anil.mehta@email.com', 'Mrs. Pooja Mehta', '+91-98101-00000', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002');

-- Grade 1 Section B Students (10 sample students out of 38)
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', 'BF-CC-2024-050', 'Kiara', 'Desai', '2019-03-18', 'Female', 'O+', 'Mr. Rajiv Desai', 'Father', '+91-98102-11111', 'rajiv.desai@email.com', 'Mrs. Anjali Desai', '+91-98102-22222', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', 'BF-CC-2024-051', 'Reyansh', 'Chopra', '2019-06-11', 'Male', 'A+', 'Mr. Karan Chopra', 'Father', '+91-98102-33333', 'karan.chopra@email.com', 'Mrs. Ritu Chopra', '+91-98102-44444', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440002', 'BF-CC-2024-052', 'Myra', 'Bansal', '2019-05-07', 'Female', 'B+', 'Mr. Deepak Bansal', 'Father', '+91-98102-55555', 'deepak.bansal@email.com', 'Mrs. Sonia Bansal', '+91-98102-66666', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002');

-- Grade 2 Section A Students (10 sample students out of 36)
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440003', 'BF-CC-2023-100', 'Aadhya', 'Malhotra', '2018-04-15', 'Female', 'O+', 'Mr. Sanjay Malhotra', 'Father', '+91-98103-11111', 'sanjay.malhotra@email.com', 'Mrs. Kavita Malhotra', '+91-98103-22222', 'Mother', '2023-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440003', 'BF-CC-2023-101', 'Ayaan', 'Kapoor', '2018-07-22', 'Male', 'A+', 'Mr. Rohit Kapoor', 'Father', '+91-98103-33333', 'rohit.kapoor@email.com', 'Mrs. Neha Kapoor', '+91-98103-44444', 'Mother', '2023-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002'),
('a50e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', '950e8400-e29b-41d4-a716-446655440003', 'BF-CC-2023-102', 'Navya', 'Saxena', '2018-02-10', 'Female', 'B+', 'Mr. Vinod Saxena', 'Father', '+91-98103-55555', 'vinod.saxena@email.com', 'Mrs. Priya Saxena', '+91-98103-66666', 'Mother', '2023-04-01', 'active', '650e8400-e29b-41d4-a716-446655440002');

-- =====================================================
-- 6. STAFF DETAILS
-- =====================================================

INSERT INTO staff (id, user_id, campus_id, employee_id, full_name, date_of_birth, gender, blood_group, email, phone, address, city, state, postal_code, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, designation, department, joining_date, employment_type, salary, highest_qualification, specialization, experience_years, status, created_by) VALUES
('b50e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'EMP-CC-001', 'Vikram Singh', '1985-03-15', 'Male', 'O+', 'teacher.math@bridgefoundation.org', '+91-98111-11111', '123 Teachers Colony', 'Mumbai', 'Maharashtra', '400010', 'Mrs. Sunita Singh', '+91-98111-11112', 'Wife', 'Senior Mathematics Teacher', 'Academic', '2020-06-01', 'Full-time', 65000.00, 'M.Sc. Mathematics', 'Applied Mathematics', 12, 'active', '650e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'EMP-CC-002', 'Anjali Desai', '1988-07-20', 'Female', 'A+', 'teacher.science@bridgefoundation.org', '+91-98111-22222', '456 Faculty Housing', 'Mumbai', 'Maharashtra', '400010', 'Mr. Rahul Desai', '+91-98111-22223', 'Husband', 'Science Teacher', 'Academic', '2021-04-15', 'Full-time', 60000.00, 'M.Sc. Physics', 'Physics Education', 8, 'active', '650e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'EMP-CC-003', 'Neha Kapoor', '1990-11-05', 'Female', 'B+', 'teacher.english@bridgefoundation.org', '+91-98111-33333', '789 Staff Quarters', 'Mumbai', 'Maharashtra', '400010', 'Mr. Amit Kapoor', '+91-98111-33334', 'Husband', 'English Teacher', 'Academic', '2019-08-20', 'Full-time', 58000.00, 'M.A. English Literature', 'English Language Teaching', 10, 'active', '650e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', 'EMP-CC-010', 'Suresh Nair', '1982-05-10', 'Male', 'O-', 'staff.admin@bridgefoundation.org', '+91-98333-11111', '321 Admin Block', 'Mumbai', 'Maharashtra', '400010', 'Mrs. Divya Nair', '+91-98333-11112', 'Wife', 'Administrative Officer', 'Administration', '2018-01-10', 'Full-time', 55000.00, 'MBA', 'Human Resources', 15, 'active', '650e8400-e29b-41d4-a716-446655440002'),
('b50e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', 'EMP-CC-011', 'Meena Iyer', '1987-09-25', 'Female', 'AB+', 'staff.accountant@bridgefoundation.org', '+91-98333-22222', '654 Accounts Office', 'Mumbai', 'Maharashtra', '400010', 'Mr. Ravi Iyer', '+91-98333-22223', 'Husband', 'Senior Accountant', 'Finance', '2019-03-15', 'Full-time', 50000.00, 'M.Com', 'Accounting & Finance', 11, 'active', '650e8400-e29b-41d4-a716-446655440002');


-- =====================================================
-- 7. COURSES (SYLLABUS)
-- =====================================================

-- Grade 1 Courses
-- Grade 1 Courses
INSERT INTO courses (id, campus_id, grade_id, name, code, description, teacher_id, credit_hours, max_marks, is_compulsory, display_order, status) VALUES
('c50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Mathematics', 'MATH-G1', 'Basic Math', '650e8400-e29b-41d4-a716-446655440010', 6, 100, true, 1, 'active'),
('c50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'English', 'ENG-G1', 'English Arts', '650e8400-e29b-41d4-a716-446655440012', 6, 100, true, 2, 'active'),
('c50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Science', 'SCI-G1', 'Basic Science', '650e8400-e29b-41d4-a716-446655440011', 4, 100, true, 3, 'active'),
('c50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Hindi', 'HIN-G1', 'Hindi Language', '650e8400-e29b-41d4-a716-446655440014', 4, 100, true, 4, 'active'),
('c50e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'Environmental Studies', 'EVS-G1', 'EVS', '650e8400-e29b-41d4-a716-446655440011', 3, 50, true, 5, 'active');

-- Grade 2 Courses
INSERT INTO courses (id, campus_id, grade_id, name, code, description, teacher_id, credit_hours, max_marks, is_compulsory, display_order, status) VALUES
('c50e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Mathematics', 'MATH-G2', 'Mathematics for Grade 2', '650e8400-e29b-41d4-a716-446655440010', 6, 100, true, 1, 'active'),
('c50e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'English', 'ENG-G2', 'English Language Arts for Grade 2', '650e8400-e29b-41d4-a716-446655440012', 6, 100, true, 2, 'active'),
('c50e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440002', 'Science', 'SCI-G2', 'Science for Grade 2', '650e8400-e29b-41d4-a716-446655440011', 4, 50, true, 3, 'active');

-- =====================================================
-- 8. CHAPTERS & TOPICS
-- =====================================================

-- Mathematics Grade 1 - Chapters
INSERT INTO chapters (id, course_id, name, description, display_order, estimated_hours) VALUES
('d50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', 'Numbers 1-20', 'Introduction to numbers from 1 to 20', 1, 15),
('d50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001', 'Addition and Subtraction', 'Basic addition and subtraction within 20', 2, 20),
('d50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440001', 'Shapes and Patterns', 'Basic geometric shapes and patterns', 3, 12),
('d50e8400-e29b-41d4-a716-446655440004', 'c50e8400-e29b-41d4-a716-446655440001', 'Measurement', 'Introduction to measurement concepts', 4, 10);

-- Mathematics Grade 1 - Topics for Chapter 1
INSERT INTO topics (id, chapter_id, name, description, display_order, learning_objectives, estimated_hours) VALUES
('e50e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440001', 'Counting 1-10', 'Learn to count from 1 to 10', 1, ARRAY['Identify numbers 1-10', 'Count objects up to 10', 'Write numbers 1-10'], 5),
('e50e8400-e29b-41d4-a716-446655440002', 'd50e8400-e29b-41d4-a716-446655440001', 'Counting 11-20', 'Learn to count from 11 to 20', 2, ARRAY['Identify numbers 11-20', 'Count objects up to 20', 'Write numbers 11-20'], 5),
('e50e8400-e29b-41d4-a716-446655440003', 'd50e8400-e29b-41d4-a716-446655440001', 'Number Comparison', 'Compare numbers using greater than, less than', 3, ARRAY['Compare two numbers', 'Use symbols > and <', 'Order numbers from smallest to largest'], 5);

-- Mathematics Grade 1 - Topics for Chapter 2
INSERT INTO topics (id, chapter_id, name, description, display_order, learning_objectives, estimated_hours) VALUES
('e50e8400-e29b-41d4-a716-446655440010', 'd50e8400-e29b-41d4-a716-446655440002', 'Addition within 10', 'Basic addition facts within 10', 1, ARRAY['Add two single-digit numbers', 'Use addition symbol +', 'Solve simple word problems'], 8),
('e50e8400-e29b-41d4-a716-446655440011', 'd50e8400-e29b-41d4-a716-446655440002', 'Subtraction within 10', 'Basic subtraction facts within 10', 2, ARRAY['Subtract single-digit numbers', 'Use subtraction symbol -', 'Solve simple word problems'], 8),
('e50e8400-e29b-41d4-a716-446655440012', 'd50e8400-e29b-41d4-a716-446655440002', 'Addition and Subtraction within 20', 'Mixed operations within 20', 3, ARRAY['Add and subtract within 20', 'Apply both operations', 'Solve multi-step problems'], 4);

-- English Grade 1 - Chapters
INSERT INTO chapters (id, course_id, name, description, display_order, estimated_hours) VALUES
('d50e8400-e29b-41d4-a716-446655440010', 'c50e8400-e29b-41d4-a716-446655440002', 'The Alphabet', 'Learning letters A-Z', 1, 16),
('d50e8400-e29b-41d4-a716-446655440011', 'c50e8400-e29b-41d4-a716-446655440002', 'Phonics and Sounds', 'Letter sounds and phonics', 2, 20),
('d50e8400-e29b-41d4-a716-446655440012', 'c50e8400-e29b-41d4-a716-446655440002', 'Simple Words', 'Reading and writing simple words', 3, 18);

-- English Grade 1 - Topics
INSERT INTO topics (id, chapter_id, name, description, display_order, learning_objectives, estimated_hours) VALUES
('e50e8400-e29b-41d4-a716-446655440020', 'd50e8400-e29b-41d4-a716-446655440010', 'Letters A-M', 'Learn uppercase and lowercase A to M', 1, ARRAY['Recognize letters A-M', 'Write letters A-M', 'Identify letter sounds'], 8),
('e50e8400-e29b-41d4-a716-446655440021', 'd50e8400-e29b-41d4-a716-446655440010', 'Letters N-Z', 'Learn uppercase and lowercase N to Z', 2, ARRAY['Recognize letters N-Z', 'Write letters N-Z', 'Identify letter sounds'], 8);

-- =====================================================
-- 9. SYLLABUS PROGRESS
-- =====================================================

-- Progress tracking for Grade 1 Section A
INSERT INTO syllabus_progress (id, course_id, section_id, chapter_id, topic_id, status, completion_date, taught_by, notes) VALUES
('f50e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440001', 'e50e8400-e29b-41d4-a716-446655440001', 'completed', '2025-09-15', '650e8400-e29b-41d4-a716-446655440010', 'Students performed well'),
('f50e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440001', 'e50e8400-e29b-41d4-a716-446655440002', 'completed', '2025-10-05', '650e8400-e29b-41d4-a716-446655440010', 'Good understanding shown'),
('f50e8400-e29b-41d4-a716-446655440003', 'c50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440001', 'e50e8400-e29b-41d4-a716-446655440003', 'in_progress', NULL, '650e8400-e29b-41d4-a716-446655440010', 'Currently teaching'),
('f50e8400-e29b-41d4-a716-446655440004', 'c50e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 'd50e8400-e29b-41d4-a716-446655440002', 'e50e8400-e29b-41d4-a716-446655440010', 'pending', NULL, '650e8400-e29b-41d4-a716-446655440010', NULL);

-- =====================================================
-- 10. ATTENDANCE RECORDS
-- =====================================================

-- Attendance for March 2026 (last 7 days)
-- For student Aarav Sharma (a50e8400-e29b-41d4-a716-446655440001)
INSERT INTO attendance (id, campus_id, student_id, grade_id, section_id, attendance_date, status, check_in_time, check_out_time, marked_by) VALUES
('1a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-10', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-11', 'present', '08:05:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-12', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-13', 'late', '08:25:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-14', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-17', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010');

-- For student Aisha Khan
INSERT INTO attendance (id, campus_id, student_id, grade_id, section_id, attendance_date, status, check_in_time, check_out_time, marked_by) VALUES
('1a0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-10', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-11', 'absent', NULL, NULL, '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-12', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-13', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-14', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-17', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010');

-- For student Rohan Patel
INSERT INTO attendance (id, campus_id, student_id, grade_id, section_id, attendance_date, status, check_in_time, check_out_time, marked_by) VALUES
('1a0e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-10', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-11', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-12', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-13', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-14', 'excused', NULL, NULL, '650e8400-e29b-41d4-a716-446655440010'),
('1a0e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03-17', 'present', '08:00:00', '14:30:00', '650e8400-e29b-41d4-a716-446655440010');

-- =====================================================
-- 11. ATTENDANCE SUMMARY
-- =====================================================

INSERT INTO attendance_summary (id, student_id, grade_id, section_id, month_year, total_days, present_days, absent_days, late_days, excused_days, attendance_percentage) VALUES
('1b0e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03', 15, 14, 0, 1, 0, 93.33),
('1b0e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03', 15, 13, 2, 0, 0, 86.67),
('1b0e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2026-03', 15, 14, 0, 0, 1, 93.33);

-- =====================================================
-- 12. EXAMS
-- =====================================================

INSERT INTO exams (id, campus_id, name, code, exam_type, academic_year, start_date, end_date, description, status, created_by) VALUES
('2a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'First Term Examination 2025-26', 'FT-2025-26', 'Mid-term', '2025-2026', '2025-10-15', '2025-10-25', 'First term examination for all grades', 'completed', '650e8400-e29b-41d4-a716-446655440002'),
('2a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Second Term Examination 2025-26', 'ST-2025-26', 'Final', '2025-2026', '2026-03-10', '2026-03-20', 'Second term final examination', 'ongoing', '650e8400-e29b-41d4-a716-446655440002'),
('2a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Unit Test 1 - Mathematics', 'UT1-MATH-2026', 'Unit Test', '2025-2026', '2026-02-10', '2026-02-10', 'Mathematics unit test', 'completed', '650e8400-e29b-41d4-a716-446655440010');

-- =====================================================
-- 13. EXAM SCHEDULES
-- =====================================================

-- First Term Exam Schedules for Grade 1
INSERT INTO exam_schedules (id, exam_id, course_id, grade_id, exam_date, start_time, end_time, max_marks, passing_marks, room_number, invigilator_id) VALUES
('2b0e8400-e29b-41d4-a716-446655440001', '2a0e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '2025-10-15', '09:00:00', '11:00:00', 100, 40, 'Exam Hall 1', '650e8400-e29b-41d4-a716-446655440010'),
('2b0e8400-e29b-41d4-a716-446655440002', '2a0e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '2025-10-16', '09:00:00', '11:00:00', 100, 40, 'Exam Hall 1', '650e8400-e29b-41d4-a716-446655440012'),
('2b0e8400-e29b-41d4-a716-446655440003', '2a0e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '2025-10-17', '09:00:00', '11:00:00', 100, 40, 'Exam Hall 1', '650e8400-e29b-41d4-a716-446655440011'),
('2b0e8400-e29b-41d4-a716-446655440004', '2a0e8400-e29b-41d4-a716-446655440001', 'c50e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440001', '2025-10-18', '09:00:00', '11:00:00', 100, 40, 'Exam Hall 1', '650e8400-e29b-41d4-a716-446655440014');

-- Second Term Exam Schedules for Grade 1
INSERT INTO exam_schedules (id, exam_id, course_id, grade_id, exam_date, start_time, end_time, max_marks, passing_marks, room_number, invigilator_id) VALUES
('2b0e8400-e29b-41d4-a716-446655440010', '2a0e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '2026-03-10', '09:00:00', '11:00:00', 100, 40, 'Exam Hall 1', '650e8400-e29b-41d4-a716-446655440010'),
('2b0e8400-e29b-41d4-a716-446655440011', '2a0e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '2026-03-11', '09:00:00', '11:00:00', 100, 40, 'Exam Hall 1', '650e8400-e29b-41d4-a716-446655440012'),
('2b0e8400-e29b-41d4-a716-446655440012', '2a0e8400-e29b-41d4-a716-446655440002', 'c50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '2026-03-12', '09:00:00', '11:00:00', 100, 40, 'Exam Hall 1', '650e8400-e29b-41d4-a716-446655440011');

-- =====================================================
-- 14. EXAM RESULTS
-- =====================================================

-- First Term Results - Grade 1 - Aarav Sharma
INSERT INTO exam_results (id, exam_schedule_id, student_id, marks_obtained, max_marks, grade, is_absent, graded_by, graded_at) VALUES
('2c0e8400-e29b-41d4-a716-446655440001', '2b0e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', 85, 100, 'A', false, '650e8400-e29b-41d4-a716-446655440010', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440002', '2b0e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440001', 78, 100, 'B+', false, '650e8400-e29b-41d4-a716-446655440012', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440003', '2b0e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440001', 92, 100, 'A+', false, '650e8400-e29b-41d4-a716-446655440011', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440004', '2b0e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440001', 88, 100, 'A', false, '650e8400-e29b-41d4-a716-446655440014', '2025-10-20 15:00:00');

-- First Term Results - Aisha Khan
INSERT INTO exam_results (id, exam_schedule_id, student_id, marks_obtained, max_marks, grade, is_absent, graded_by, graded_at) VALUES
('2c0e8400-e29b-41d4-a716-446655440010', '2b0e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440002', 75, 100, 'B', false, '650e8400-e29b-41d4-a716-446655440010', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440011', '2b0e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', 82, 100, 'A-', false, '650e8400-e29b-41d4-a716-446655440012', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440012', '2b0e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440002', 88, 100, 'A', false, '650e8400-e29b-41d4-a716-446655440011', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440013', '2b0e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440002', 79, 100, 'B+', false, '650e8400-e29b-41d4-a716-446655440014', '2025-10-20 15:00:00');

-- First Term Results - Rohan Patel
INSERT INTO exam_results (id, exam_schedule_id, student_id, marks_obtained, max_marks, grade, is_absent, graded_by, graded_at) VALUES
('2c0e8400-e29b-41d4-a716-446655440020', '2b0e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440003', 95, 100, 'A+', false, '650e8400-e29b-41d4-a716-446655440010', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440021', '2b0e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440003', 90, 100, 'A+', false, '650e8400-e29b-41d4-a716-446655440012', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440022', '2b0e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440003', 93, 100, 'A+', false, '650e8400-e29b-41d4-a716-446655440011', '2025-10-20 15:00:00'),
('2c0e8400-e29b-41d4-a716-446655440023', '2b0e8400-e29b-41d4-a716-446655440004', 'a50e8400-e29b-41d4-a716-446655440003', 91, 100, 'A+', false, '650e8400-e29b-41d4-a716-446655440014', '2025-10-20 15:00:00');

-- =====================================================
-- 15. REPORT CARDS
-- =====================================================

INSERT INTO report_cards (id, student_id, exam_id, grade_id, section_id, total_marks_obtained, total_max_marks, percentage, overall_grade, rank_in_class, rank_in_grade, attendance_percentage, conduct_grade, remarks, generated_by) VALUES
('2d0e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '2a0e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 343, 400, 85.75, 'A', 3, 5, 95.5, 'A', 'Excellent performance. Keep up the good work!', '650e8400-e29b-41d4-a716-446655440002'),
('2d0e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '2a0e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 324, 400, 81.00, 'A-', 8, 15, 88.2, 'B+', 'Good performance. Work on attendance.', '650e8400-e29b-41d4-a716-446655440002'),
('2d0e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440003', '2a0e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', 369, 400, 92.25, 'A+', 1, 1, 97.8, 'A+', 'Outstanding performance! Top of the class.', '650e8400-e29b-41d4-a716-446655440002');

-- =====================================================
-- 16. GRADING SCALES
-- =====================================================

INSERT INTO grading_scales (id, campus_id, name, grade, min_percentage, max_percentage, grade_point, description, display_order) VALUES
('3a0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Outstanding', 'A+', 90.00, 100.00, 4.00, 'Outstanding performance', 1),
('3a0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Excellent', 'A', 80.00, 89.99, 3.75, 'Excellent performance', 2),
('3a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Very Good', 'A-', 75.00, 79.99, 3.50, 'Very good performance', 3),
('3a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Good Plus', 'B+', 70.00, 74.99, 3.25, 'Good performance', 4),
('3a0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Good', 'B', 60.00, 69.99, 3.00, 'Satisfactory performance', 5),
('3a0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'Average', 'C', 50.00, 59.99, 2.50, 'Average performance', 6),
('3a0e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'Below Average', 'D', 40.00, 49.99, 2.00, 'Below average - needs improvement', 7),
('3a0e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Fail', 'F', 0.00, 39.99, 0.00, 'Failed - requires remedial work', 8);

-- =====================================================
-- 17. AUDIT LOGS
-- =====================================================

INSERT INTO audit_logs (id, user_id, campus_id, action, entity_type, entity_id, details, ip_address, timestamp) VALUES
('4a0e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'student', 'a50e8400-e29b-41d4-a716-446655440001', '{"student_name": "Aarav Sharma", "admission_number": "BF-CC-2024-001"}', '192.168.1.100', '2024-04-01 10:00:00'),
('4a0e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'attendance', '1a0e8400-e29b-41d4-a716-446655440001', '{"date": "2026-03-10", "status": "present"}', '192.168.1.101', '2026-03-10 08:30:00'),
('4a0e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'exam_result', '2c0e8400-e29b-41d4-a716-446655440001', '{"student": "Aarav Sharma", "exam": "First Term", "marks": 85}', '192.168.1.101', '2025-10-20 15:00:00'),
('4a0e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440001', NULL, 'LOGIN', 'user', '650e8400-e29b-41d4-a716-446655440001', '{"login_method": "email"}', '192.168.1.10', '2026-03-17 09:00:00'),
('4a0e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'APPROVE', 'registration_request', '750e8400-e29b-41d4-a716-446655440003', '{"email": "approved.teacher@bridgefoundation.org", "role": "teacher"}', '192.168.1.100', '2026-03-10 10:00:00'),
('4a0e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'BULK_TRANSFER', 'student', NULL, '{"students_count": 25, "from_grade": "Grade 1", "to_grade": "Grade 2"}', '192.168.1.100', '2026-04-01 14:30:00'),
('4a0e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'UPDATE', 'syllabus_progress', 'f50e8400-e29b-41d4-a716-446655440003', '{"topic": "Number Comparison", "status": "in_progress"}', '192.168.1.101', '2026-03-15 11:00:00'),
('4a0e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'CREATE', 'chapter', 'd50e8400-e29b-41d4-a716-446655440010', '{"course": "English", "chapter": "The Alphabet"}', '192.168.1.102', '2025-06-15 10:00:00');

-- =====================================================
-- 18. SYSTEM SETTINGS
-- =====================================================

INSERT INTO system_settings (id, campus_id, setting_key, setting_value, setting_type, description, is_editable) VALUES
('5a0e8400-e29b-41d4-a716-446655440001', NULL, 'academic_year', '2025-2026', 'string', 'Current academic year', true),
('5a0e8400-e29b-41d4-a716-446655440002', NULL, 'organization_name', 'The Bridge Foundation', 'string', 'Organization name', false),
('5a0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'school_start_time', '08:00', 'string', 'School start time', true),
('5a0e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'school_end_time', '14:30', 'string', 'School end time', true),
('5a0e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'late_threshold_minutes', '15', 'number', 'Minutes after which student is marked late', true),
('5a0e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'minimum_attendance_percentage', '75', 'number', 'Minimum required attendance percentage', true),
('5a0e8400-e29b-41d4-a716-446655440007', NULL, 'brand_primary_color', '#D32F2F', 'string', 'Primary brand color (red)', false),
('5a0e8400-e29b-41d4-a716-446655440008', NULL, 'enable_grade_transfers', 'true', 'boolean', 'Enable bulk grade transfers', true),
('5a0e8400-e29b-41d4-a716-446655440009', NULL, 'enable_registration_approval', 'true', 'boolean', 'Enable registration approval workflow', true);

-- =====================================================
-- 19. STUDENT ENROLLMENT HISTORY
-- =====================================================

INSERT INTO student_enrollment_history (id, student_id, grade_id, section_id, academic_year, enrollment_date, exit_date, status, transferred_by, remarks) VALUES
('6a0e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2025-2026', '2024-04-01', NULL, 'active', NULL, 'Initial enrollment'),
('6a0e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2025-2026', '2024-04-01', NULL, 'active', NULL, 'Initial enrollment'),
('6a0e8400-e29b-41d4-a716-446655440003', 'a50e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440001', '950e8400-e29b-41d4-a716-446655440001', '2025-2026', '2024-04-01', NULL, 'active', NULL, 'Initial enrollment');


-- =====================================================
-- FIX: SOUTH CAMPUS SECTIONS & STUDENTS
-- =====================================================

-- Create Section A for South Campus (Grade 1)
-- Using Rahul Mehta (Teacher) as the class teacher
INSERT INTO sections (id, grade_id, name, code, class_teacher_id, max_capacity, current_strength, room_number) VALUES
('950e8400-e29b-41d4-a716-446655440010', '850e8400-e29b-41d4-a716-446655440010', 'Section A', 'A', '650e8400-e29b-41d4-a716-446655440020', 40, 5, 'Room S-101');

-- Enroll 5 Students into South Campus (Grade 1, Section A)
-- Using Arjun Patel (South Campus Admin) as the creator
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440010', 'BF-SC-2024-001', 'Zain', 'Qureshi', '2019-11-12', 'Male', 'B+', 'Mr. Tariq Qureshi', 'Father', '+91-98200-11111', 'tariq.q@email.com', 'Mrs. Sana Qureshi', '+91-98200-22222', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440010', 'BF-SC-2024-002', 'Zara', 'Ali', '2019-09-05', 'Female', 'O+', 'Mr. Imran Ali', 'Father', '+91-98200-33333', 'imran.ali@email.com', 'Mrs. Hira Ali', '+91-98200-44444', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440010', 'BF-SC-2024-003', 'Omar', 'Farooq', '2019-01-20', 'Male', 'A-', 'Mr. Salman Farooq', 'Father', '+91-98200-55555', 'salman.f@email.com', 'Mrs. Ayesha Farooq', '+91-98200-66666', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440010', 'BF-SC-2024-004', 'Sara', 'Sheikh', '2019-12-15', 'Female', 'AB+', 'Mr. Danish Sheikh', 'Father', '+91-98200-77777', 'danish.s@email.com', 'Mrs. Kiran Sheikh', '+91-98200-88888', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440010', '950e8400-e29b-41d4-a716-446655440010', 'BF-SC-2024-005', 'Bilal', 'Hassan', '2019-03-30', 'Male', 'O-', 'Mr. Waqas Hassan', 'Father', '+91-98200-99999', 'waqas.h@email.com', 'Mrs. Nida Hassan', '+91-98200-00000', 'Mother', '2024-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003');

-- =====================================================
-- ADDING A SECOND CLASS FOR RAHUL MEHTA
-- =====================================================

-- Create Section A for South Campus (Grade 2)
-- Assigning Rahul Mehta as the class teacher here as well!
INSERT INTO sections (id, grade_id, name, code, class_teacher_id, max_capacity, current_strength, room_number) VALUES
('950e8400-e29b-41d4-a716-446655440011', '850e8400-e29b-41d4-a716-446655440011', 'Section A', 'A', '650e8400-e29b-41d4-a716-446655440020', 40, 2, 'Room S-102');

-- Enroll 2 Students into South Campus (Grade 2, Section A)
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440011', 'BF-SC-2023-001', 'Aarush', 'Rao', '2018-05-14', 'Male', 'B+', 'Mr. Karthik Rao', 'Father', '+91-98200-12345', 'karthik.r@email.com', 'Mrs. Priya Rao', '+91-98200-54321', 'Mother', '2023-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440011', '950e8400-e29b-41d4-a716-446655440011', 'BF-SC-2023-002', 'Isha', 'Menon', '2018-08-22', 'Female', 'O+', 'Mr. Suresh Menon', 'Father', '+91-98200-67890', 'suresh.m@email.com', 'Mrs. Ananya Menon', '+91-98200-09876', 'Mother', '2023-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003');

-- =====================================================
-- SOUTH CAMPUS EXPANSION: GRADE 3
-- =====================================================

-- 1. Create Section A for South Campus (Grade 3)
-- Assigning Mrs. Sunita Agarwal as the class teacher
INSERT INTO sections (id, grade_id, name, code, class_teacher_id, max_capacity, current_strength, room_number) VALUES
('950e8400-e29b-41d4-a716-446655440012', '850e8400-e29b-41d4-a716-446655440012', 'Section A', 'A', '650e8400-e29b-41d4-a716-446655440021', 40, 5, 'Room S-103');

-- 2. Enroll 5 Students into South Campus (Grade 3, Section A)
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440012', 'BF-SC-2022-001', 'Riya', 'Kapoor', '2017-02-14', 'Female', 'A+', 'Mr. Dev Kapoor', 'Father', '+91-98200-11223', 'dev.k@email.com', 'Mrs. Priya Kapoor', '+91-98200-33445', 'Mother', '2022-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440012', 'BF-SC-2022-002', 'Kabir', 'Singh', '2017-06-20', 'Male', 'O+', 'Mr. Raj Singh', 'Father', '+91-98200-22334', 'raj.s@email.com', 'Mrs. Neha Singh', '+91-98200-44556', 'Mother', '2022-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440210', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440012', 'BF-SC-2022-003', 'Ananya', 'Desai', '2017-09-10', 'Female', 'B-', 'Mr. Amit Desai', 'Father', '+91-98200-33445', 'amit.d@email.com', 'Mrs. Pooja Desai', '+91-98200-55667', 'Mother', '2022-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440211', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440012', 'BF-SC-2022-004', 'Vivaan', 'Joshi', '2017-11-25', 'Male', 'AB+', 'Mr. Sameer Joshi', 'Father', '+91-98200-44556', 'sameer.j@email.com', 'Mrs. Kavita Joshi', '+91-98200-66778', 'Mother', '2022-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440212', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440012', '950e8400-e29b-41d4-a716-446655440012', 'BF-SC-2022-005', 'Meera', 'Nair', '2017-03-05', 'Female', 'O-', 'Mr. Suresh Nair', 'Father', '+91-98200-55667', 'suresh.n@email.com', 'Mrs. Divya Nair', '+91-98200-77889', 'Mother', '2022-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003');

-- =====================================================
-- SOUTH CAMPUS EXPANSION: GRADE 4
-- =====================================================

-- 1. Create Grade 4 for South Campus (The Grade itself didn't exist yet!)
INSERT INTO grades (id, campus_id, name, code, display_order, academic_year, status) VALUES
('850e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'Grade 4', 'G4', 4, '2025-2026', 'active');

-- 2. Create Section A for South Campus (Grade 4)
-- Assigning Mr. Rahul Mehta as the class teacher
INSERT INTO sections (id, grade_id, name, code, class_teacher_id, max_capacity, current_strength, room_number) VALUES
('950e8400-e29b-41d4-a716-446655440013', '850e8400-e29b-41d4-a716-446655440013', 'Section A', 'A', '650e8400-e29b-41d4-a716-446655440021', 40, 5, 'Room S-104');

-- 3. Enroll 5 Students into South Campus (Grade 4, Section A)
INSERT INTO students (id, campus_id, current_grade_id, current_section_id, admission_number, first_name, last_name, date_of_birth, gender, blood_group, father_name, mother_name, guardian_phone, guardian_email, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, admission_date, status, created_by) VALUES
('a50e8400-e29b-41d4-a716-446655440213', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440013', 'BF-SC-2021-001', 'Arnav', 'Bhatia', '2016-04-10', 'Male', 'B+', 'Mr. Rajiv Bhatia', 'Father', '+91-98201-11223', 'rajiv.b@email.com', 'Mrs. Simran Bhatia', '+91-98201-33445', 'Mother', '2021-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440214', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440013', 'BF-SC-2021-002', 'Saanvi', 'Sharma', '2016-08-22', 'Female', 'O+', 'Mr. Vikas Sharma', 'Father', '+91-98201-22334', 'vikas.s@email.com', 'Mrs. Pooja Sharma', '+91-98201-44556', 'Mother', '2021-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440215', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440013', 'BF-SC-2021-003', 'Ayaan', 'Verma', '2016-11-05', 'Male', 'A-', 'Mr. Sanjay Verma', 'Father', '+91-98201-33445', 'sanjay.v@email.com', 'Mrs. Anita Verma', '+91-98201-55667', 'Mother', '2021-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440216', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440013', 'BF-SC-2021-004', 'Diya', 'Patel', '2016-01-18', 'Female', 'AB+', 'Mr. Hitesh Patel', 'Father', '+91-98201-44556', 'hitesh.p@email.com', 'Mrs. Leena Patel', '+91-98201-66778', 'Mother', '2021-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003'),
('a50e8400-e29b-41d4-a716-446655440217', '550e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440013', '950e8400-e29b-41d4-a716-446655440013', 'BF-SC-2021-005', 'Krish', 'Iyer', '2016-05-30', 'Male', 'O-', 'Mr. Madhavan Iyer', 'Father', '+91-98201-55667', 'madhavan.i@email.com', 'Mrs. Lakshmi Iyer', '+91-98201-77889', 'Mother', '2021-04-01', 'active', '650e8400-e29b-41d4-a716-446655440003');



-- =====================================================
-- END OF SEED FILE
-- =====================================================

-- Summary Statistics
-- Campuses: 4
-- Users: 17 (1 Super Admin, 4 Campus Admins, 8 Teachers, 2 Staff, 2 Pending)
-- Grades: 11 (8 Central Campus, 3  Campus)
-- Sections: 5
-- Students: 18 (sample data - production would have more)
-- Staff Records: 5
-- Courses: 8
-- Chapters: 5
-- Topics: 8
-- Attendance Records: 18
-- Exams: 3
-- Exam Schedules: 7
-- Exam Results: 12
-- Report Cards: 3
-- Audit Logs: 8
-- System Settings: 9
