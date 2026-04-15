import pool from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration() {
  const migrationPath = path.join(__dirname, '../database/migrations/20260415_refine_timetable_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  console.log('Running migration...');
  try {
    await pool.query(sql);
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
