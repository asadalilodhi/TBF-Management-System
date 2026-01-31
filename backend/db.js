const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'db', // db matches the service name in docker-compose
  database: process.env.POSTGRES_DB || 'tbf_system',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  port: 5432,
});

module.exports = pool;