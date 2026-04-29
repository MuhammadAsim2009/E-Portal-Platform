import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

async function migrate() {
  const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    database: 'e_portal_db',
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Adding missing columns to faculty table...');
    await pool.query(`
      ALTER TABLE faculty 
      ADD COLUMN IF NOT EXISTS biography TEXT,
      ADD COLUMN IF NOT EXISTS address TEXT
    `);
    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
