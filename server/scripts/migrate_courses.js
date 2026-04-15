import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

async function migrate() {
  try {
    console.log('Migrating courses table...');
    await pool.query("ALTER TABLE courses ADD COLUMN IF NOT EXISTS max_seats INT DEFAULT 40;");
    console.log('Migration successful: max_seats added.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
