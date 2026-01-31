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
  const { username, password } = req.body;

  try {
    // 1. Find user in DB
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Compare the "Blender" hash
    // (Input Password vs Stored Hash)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate the Digital Badge (Token)
    const token = jwt.sign(
      { id: user.id, role: user.role, campus_id: user.campus_id },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login successful', token, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TEST ROUTE (To verify DB connection)
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'TBF Backend Connected!', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// TEMP ROUTE: Delete this after you get your hash!
app.get('/hash/:password', async (req, res) => {
  const hash = await bcrypt.hash(req.params.password, 10);
  res.send(hash);
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});