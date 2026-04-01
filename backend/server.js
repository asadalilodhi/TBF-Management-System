const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = 'your_super_secret_jwt_key'; // In prod, put this in .env

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

// --- SECURITY MIDDLEWARE ---
// This function acts as the bouncer. It checks the digital badge before letting anyone in.
const authenticateToken = (req, res, next) => {
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

// GET STUDENTS (Filtered by Role & Campus)
app.get('/api/students', authenticateToken, async (req, res) => {
  try {
    const { role, campus_id } = req.user;
    
    // Base query using your brilliant database view
    let query = `SELECT * FROM vw_student_details WHERE status = 'active'`;
    let params = [];

    // If they are NOT a super admin, force the query to only search their campus
    if (role !== 'super_admin') {
      query += ` AND campus_id = $1`;
      params.push(campus_id);
    }

    query += ` ORDER BY first_name ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).json({ error: 'Server error while fetching students' });
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
      query = `SELECT * FROM vw_student_details WHERE status = 'active' ORDER BY first_name ASC`;
    } 
    else if (role === 'campus_admin') {
      query = `SELECT * FROM vw_student_details WHERE status = 'active' AND campus_id = $1 ORDER BY first_name ASC`;
      params.push(campus_id);
    } 
    else if (role === 'teacher') {
      // Magic Query: Get students if the user is their Class Teacher OR teaches one of their Courses
      query = `
        SELECT DISTINCT s.* FROM vw_student_details s
        LEFT JOIN sections sec ON s.current_section_id = sec.id
        LEFT JOIN courses c ON s.current_grade_id = c.grade_id
        WHERE (sec.class_teacher_id = $1 OR c.teacher_id = $1) 
        AND s.status = 'active'
        ORDER BY s.first_name ASC
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