const { Pool } = require('pg');

// We use DATABASE_URL for Supabase. If it's not provided, we fall back to local config.
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.fjtnecrxovqlrqsynyns:tbfmiskhidmat@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  // Supabase often requires SSL for external connections
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Connected to Database successfully at:', res.rows[0].now);
  }
});

module.exports = pool;