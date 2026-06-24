const { Client } = require('pg');

const connectionString = 'postgresql://postgres.fjtnecrxovqlrqsynyns:tbfmiskhidmat@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres';

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function inspectDb() {
  try {
    await client.connect();
    
    // Get all tables in public schema
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    `;
    const tablesRes = await client.query(tablesQuery);
    
    if (tablesRes.rows.length === 0) {
      console.log('No tables found in the public schema.');
      return;
    }

    console.log('--- DATABASE SCHEMA ---');
    
    // Get columns for each table
    for (let row of tablesRes.rows) {
      const tableName = row.table_name;
      console.log(`\nTable: ${tableName}`);
      
      const colsQuery = `
        SELECT column_name, data_type, character_maximum_length, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `;
      const colsRes = await client.query(colsQuery, [tableName]);
      
      for (let col of colsRes.rows) {
        let typeInfo = col.data_type;
        if (col.character_maximum_length) typeInfo += `(${col.character_maximum_length})`;
        let nullInfo = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        console.log(`  - ${col.column_name}: ${typeInfo} (${nullInfo})`);
      }
    }
    
  } catch (err) {
    console.error('Error inspecting DB:', err);
  } finally {
    await client.end();
  }
}

inspectDb();
