const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_super_secret_jwt_key'; // In prod, put this in .env


async function getLookupId(tableName, searchColumn, searchValue, parentColumn = null, parentId = null) {
  let query = `SELECT id FROM ${tableName} WHERE ${searchColumn} = $1`;
  let params = [searchValue];

  // Scoped lookup (e.g., Find "Section A", but ONLY inside "Grade 3")
  if (parentColumn && parentId) {
    query += ` AND ${parentColumn} = $2`;
    params.push(parentId);
  }

  const result = await pool.query(query, params);
  if (result.rows.length === 0) {
    throw new Error(`Could not find a valid ${tableName} matching '${searchValue}'`);
  }
  return result.rows[0].id;
}




// LOGIN ROUTE
app.post('/api/auth/login', async (req, res) => {
  const { email, password, campus } = req.body; // 'campus' comes from the Login screen dropdown

  try {
    // 1. Find user in DB and get their EXACT Campus Name
    const query = `
      SELECT u.*, c.name as campus_name 
      FROM users u 
      LEFT JOIN campuses c ON u.campus_id = c.id 
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Password Check
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // 3. STRICT CAMPUS VALIDATION (The Fix!)
    if (user.role !== 'super_admin') {
      // If their DB campus name does NOT contain the dropdown selection (e.g. "South Campus")
      if (!user.campus_name || !user.campus_name.includes(campus)) {
        return res.status(403).json({ 
          error: `Access Denied: You are not assigned to ${campus}.` 
        });
      }
    }

    // 4. Generate Token
    const token = jwt.sign(
      { id: user.id, role: user.role, campus_id: user.campus_id },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // --- NEW: THE FRONTEND TRANSLATOR ---
    // Fix 1: Translate DB role to UI role so the sidebar doesn't disappear
    let uiRole = user.role === 'campus_admin' ? 'admin' : user.role;

    // Fix 2: Translate DB campus to UI campus so the Dashboard doesn't crash
    let uiCampus = 'Both'; // Default for super_admin
    if (user.campus_name) {
      if (user.campus_name.includes('North')) uiCampus = 'North Campus';
      else if (user.campus_name.includes('South')) uiCampus = 'South Campus';
      else if (user.campus_name.includes('Central')) uiCampus = 'Central Campus';
    }

    // 5. Format user exactly how App.jsx expects it
    const frontendUser = {
      id: user.id,
      email: user.email,
      name: user.full_name,
      role: uiRole,
      campus: uiCampus 
    };

    res.json({ 
      message: 'Login successful', 
      token, 
      user: frontendUser,
      assignedCampus: uiCampus // Safely locks the Nav Bar dropdown!
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TEST ROUTE
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'TBF Backend Connected!', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});


// Add a new Campus (Super Admin Only)
app.post('/api/campuses', authenticateToken, async (req, res) => {
  const { name, address, phone } = req.body;

  // Security Check: Only Super Admins can create campuses
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Admins can manage campuses.' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Campus name is required.' });
  }

  try {
    const query = `
      INSERT INTO campuses (name, code, address, phone, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING *
    `;
    // We generate a simple code based on the first 3 letters of the name + random number
    const code = `${name.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const values = [name, code, address, phone];

    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating campus:', err);
    // Handle specific PostgreSQL error for duplicate names (unique constraint violation)
    if (err.code === '23505') {
      return res.status(400).json({ error: 'A campus with this name already exists.' });
    }
    res.status(500).json({ error: 'Server error while creating campus.' });
  }
});

// Update an existing Campus (Super Admin Only)
app.put('/api/campuses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, address, phone } = req.body;

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Admins can manage campuses.' });
  }

  try {
    const query = `
      UPDATE campuses
      SET name = $1, address = $2, phone = $3
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [name, address, phone, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campus not found.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating campus:', err);
    res.status(500).json({ error: 'Server error while updating campus.' });
  }
});

// "Delete" (Soft Delete/Deactivate) a Campus
app.delete('/api/campuses/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Only Super Admins can manage campuses.' });
  }

  try {
    // Instead of completely dropping the table row (which would break relational data like student records), 
    // we simply mark the campus as 'inactive'
    const query = `
      UPDATE campuses
      SET status = 'inactive'
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campus not found.' });
    }

    res.json({ message: 'Campus deactivated successfully.' });
  } catch (err) {
    console.error('Error deleting campus:', err);
    res.status(500).json({ error: 'Server error while deleting campus.' });
  }
});


// ==========================================
// PUBLIC ROUTES (No Token Required)
// ==========================================

// Fetch active campuses for the registration dropdown
app.get('/api/public/campuses', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM campuses WHERE status = 'active' ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching public campuses:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a new registration request
app.post('/api/registrations', async (req, res) => {
  const { name, email, role, campus } = req.body;
  
  try {
    // 1. Look up the campus UUID based on the string name
    let campusId = null;
    if (campus) {
      const campusRes = await pool.query('SELECT id FROM campuses WHERE name = $1 LIMIT 1', [campus]);
      if (campusRes.rows.length > 0) campusId = campusRes.rows[0].id;
    }

    // 2. Insert the pending request into the database
    const query = `
      INSERT INTO registration_requests (full_name, email, role, campus_id, status)
      VALUES ($1, $2, $3, $4, 'pending') RETURNING *
    `;
    const result = await pool.query(query, [name, email, role, campusId]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating registration request:', err);
    res.status(500).json({ error: 'Server error while submitting request.' });
  }
});

// --- SECURITY MIDDLEWARE ---
function authenticateToken(req, res, next) { 
  // Get the token from the request headers
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format is "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  // Verify the token
  jwt.verify(token, SECRET_KEY, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    // Attach the user info (id, role, campus_id) to the request so routes can use it
    req.user = decodedUser;
    next(); // Pass them through to the actual route
  });
};

// --- SECURE ROUTES ---

// ── SECURE FETCH STUDENTS ROUTE ───────────────────────────────────────
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    // We explicitly select father_name and mother_name now
    const query = `
      SELECT 
        s.*, 
        c.name as campus_name, 
        g.name as grade_name, 
        sec.code as section_code
      FROM students s
      LEFT JOIN campuses c ON s.campus_id = c.id
      LEFT JOIN grades g ON s.current_grade_id = g.id
      LEFT JOIN sections sec ON s.current_section_id = sec.id
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error while fetching students.' });
  }
});


// ==========================================
// CAMPUS & AUDIT ROUTES
// ==========================================

app.get('/api/campuses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM campuses WHERE status = 'active' ORDER BY name");
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error fetching campuses' }); }
});

app.get('/api/audit-logs', authenticateToken, async (req, res) => {
  try {
    const query = `SELECT a.id, a.action, a.timestamp, a.details->>'description' as details, u.full_name as user 
                   FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.timestamp DESC LIMIT 100`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/registrations/pending', authenticateToken, async (req, res) => {
  try {
    const query = `SELECT r.id, r.full_name as name, r.email, r.role, c.name as campus, r.request_date as "requestedAt", r.status
                   FROM registration_requests r LEFT JOIN campuses c ON r.campus_id = c.id WHERE r.status = 'pending'`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ==========================================
// STAFF & EXAM ROUTES
// ==========================================

app.get('/api/staff', authenticateToken, async (req, res) => {
  try {
    // Return empty array if no campus is provided instead of failing
    if (!req.query.campus || req.query.campus === 'No Campus Available') return res.json([]);
    
    const query = `SELECT st.*, c.name as campus_name FROM staff st 
                   LEFT JOIN campuses c ON st.campus_id = c.id 
                   WHERE c.name = $1`;
    const result = await pool.query(query, [req.query.campus]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error fetching staff' }); }
});

app.get('/api/exams', authenticateToken, async (req, res) => {
  try {
    if (!req.query.campus || req.query.campus === 'No Campus Available') return res.json([]);
    
    const query = `SELECT e.* FROM exams e 
                   LEFT JOIN campuses c ON e.campus_id = c.id 
                   WHERE c.name = $1`;
    const result = await pool.query(query, [req.query.campus]);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Server error fetching exams' }); }
});


// ── SECURE ADD STUDENT ROUTE ──────────────────────────────────────────
// ── SECURE ADD STUDENT ROUTE (WITH AUTO GR-NUMBER) ──────────────────────────
// ADD NEW STUDENT
app.post('/api/students', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      fullName, admissionNumber, dateOfBirth, gender,
      campus, grade, section, phone, fatherName, motherName, address,
      previousSchool, testResult, admissionStatus
    } = req.body;

    // Start a transaction in case a lookup fails
    await client.query('BEGIN');

    // 1. DYNAMIC UUID TRANSLATIONS
    // Translate "North Campus" -> UUID
    const campusId = await getLookupId('campuses', 'name', campus);
    
    // Translate "Grade 3" -> UUID (Scoped to the specific campus)
    const gradeId = await getLookupId('grades', 'name', grade, 'campus_id', campusId);
    
    // Translate "Section A" -> UUID (Scoped to the specific grade)
    const sectionId = await getLookupId('sections', 'code', section, 'grade_id', gradeId);

    // 2. INSERT THE STUDENT WITH PROPER UUIDs
    const insertQuery = `
      INSERT INTO students (
        admission_number, full_name, date_of_birth, gender,
        campus_id, current_grade_id, current_section_id,
        guardian_phone, father_name, mother_name, address,
        previous_school, test_result, admission_status, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, full_name, admission_number;
    `;
    
    const values = [
      admissionNumber, fullName, dateOfBirth || null, gender,
      campusId, gradeId, sectionId,
      phone, fatherName, motherName, address,
      previousSchool, testResult, admissionStatus, req.user.id
    ];

    const newStudent = await client.query(insertQuery, values);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    res.status(201).json(newStudent.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding student:', error);
    
    // If our translation helper threw an error, send that specific message to the frontend
    if (error.message.includes('Could not find')) {
      return res.status(400).json({ error: error.message });
    }
    
    // Handle Unique Constraint violations (like duplicate GR numbers)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A student with this GR Number already exists.' });
    }
    
    res.status(500).json({ error: 'Internal Server Error while creating student.' });
  } finally {
    client.release();
  }
});

// ── SECURE ADD GRADE & SECTION ROUTE ──────────────────────────────────
app.post('/api/setup/grade', authenticateToken, async (req, res) => {
  const { campusName, gradeName, sectionName } = req.body;
  
  // NEW: Allow UI to specify the section, otherwise default to Section A
  const targetSection = sectionName || 'Section A';
  const sectionCode = targetSection.replace('Section ', '').substring(0, 1).toUpperCase();

  try {
    const campusRes = await pool.query(`SELECT id FROM campuses WHERE name LIKE $1 LIMIT 1`, [`%${campusName}%`]);
    const campusId = campusRes.rows[0]?.id;

    if (!campusId) return res.status(400).json({ error: `Campus '${campusName}' not found in database.` });

    const gradeCheck = await pool.query(`SELECT id FROM grades WHERE name = $1 AND campus_id = $2`, [gradeName, campusId]);
    let gradeId;

    if (gradeCheck.rows.length > 0) {
        gradeId = gradeCheck.rows[0].id;
    } else {
        const gradeCode = gradeName.replace('Grade ', 'G'); 
        const newGrade = await pool.query(`
          INSERT INTO grades (id, campus_id, name, code, display_order, academic_year, status)
          VALUES (gen_random_uuid(), $1, $2, $3, 99, '2025-2026', 'active')
          RETURNING id
        `, [campusId, gradeName, gradeCode]);
        gradeId = newGrade.rows[0].id;
    }

    const sectionCheck = await pool.query(`SELECT id FROM sections WHERE name = $1 AND grade_id = $2`, [targetSection, gradeId]);
    if (sectionCheck.rows.length === 0) {
        await pool.query(`
          INSERT INTO sections (id, grade_id, name, code, max_capacity, current_strength)
          VALUES (gen_random_uuid(), $1, $2, $3, 40, 0)
        `, [gradeId, targetSection, sectionCode]);
    }

    res.status(201).json({ message: `${gradeName} ${targetSection} successfully created for ${campusName}!` });
  } catch (err) {
    console.error('Error creating grade infrastructure:', err);
    res.status(500).json({ error: 'Server error while building Grade.' });
  }
});

// ── NEW: SECURE FETCH ALL EXISTING CLASSES ROUTE ─────────────────────────
app.get('/api/classes', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT c.name as campus_name, g.name as grade_name, s.name as section_name
      FROM grades g
      JOIN sections s ON g.id = s.grade_id
      JOIN campuses c ON g.campus_id = c.id
      ORDER BY c.name, g.display_order, s.name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Server error fetching classes.' });
  }
});

// ── SECURE ATTENDANCE ROUTE ──────────────────────────────────────────
// Teachers only get students they teach. Admins get their whole campus.
app.get('/api/attendance/my-students', authenticateToken, async (req, res) => {
  try {
    const { id, role, campus_id } = req.user;
    let query = '';
    let params = [];

    if (role === 'super_admin') {
      // FIXED: ORDER BY full_name
      query = `SELECT * FROM vw_student_details WHERE status = 'active' ORDER BY full_name ASC`;
    } 
    else if (role === 'campus_admin') {
      // FIXED: ORDER BY full_name
      query = `SELECT * FROM vw_student_details WHERE status = 'active' AND campus_id = $1 ORDER BY full_name ASC`;
      params.push(campus_id);
    } 
    else if (role === 'teacher') {
      // Magic Query: Get students if the user is their Class Teacher OR teaches one of their Courses
      // FIXED: ORDER BY s.full_name
      query = `
        SELECT DISTINCT s.* FROM vw_student_details s
        LEFT JOIN sections sec ON s.current_section_id = sec.id
        LEFT JOIN courses c ON s.current_grade_id = c.grade_id
        WHERE (sec.class_teacher_id = $1 OR c.teacher_id = $1) 
        AND s.status = 'active'
        ORDER BY s.full_name ASC
      `;
      params.push(id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching students for attendance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── SECURE SYLLABUS ROUTE ────────────────────────────────────────────
// Teachers only see the syllabus for courses they specifically teach
app.get('/api/syllabus/my-courses', authenticateToken, async (req, res) => {
  try {
    const { id, role, campus_id } = req.user;
    let query = '';
    let params = [];

    if (role === 'super_admin' || role === 'campus_admin') {
      // Admins see all courses (Filtered by campus for Campus Admin)
      query = `
        SELECT c.id as course_id, c.name as course_name, g.name as grade_name, c.campus_id
        FROM courses c
        JOIN grades g ON c.grade_id = g.id
        ${role === 'campus_admin' ? 'WHERE c.campus_id = $1' : ''}
        ORDER BY g.display_order, c.display_order
      `;
      if (role === 'campus_admin') params.push(campus_id);
    } 
    else if (role === 'teacher') {
      // Teachers only see their assigned courses
      query = `
        SELECT c.id as course_id, c.name as course_name, g.name as grade_name
        FROM courses c
        JOIN grades g ON c.grade_id = g.id
        WHERE c.teacher_id = $1
        ORDER BY g.display_order, c.display_order
      `;
      params.push(id);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching syllabus:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET DASHBOARD STATS
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const { role, campus_id } = req.user;
    let query = '';
    let params = [];

    // Super Admin gets global totals. Campus Admin gets local totals.
    if (role === 'super_admin') {
      query = `SELECT 
                (SELECT COUNT(*) FROM students WHERE status = 'active') as total_students,
                (SELECT COUNT(*) FROM staff WHERE status = 'active') as total_staff,
                (SELECT COUNT(*) FROM campuses WHERE status = 'active') as total_campuses`;
    } else {
      query = `SELECT 
                (SELECT COUNT(*) FROM students WHERE campus_id = $1 AND status = 'active') as total_students,
                (SELECT COUNT(*) FROM staff WHERE campus_id = $1 AND status = 'active') as total_staff`;
      params = [campus_id];
    }

    const result = await pool.query(query, params);
    res.json(result.rows[0]);

  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Server error while fetching stats' });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});