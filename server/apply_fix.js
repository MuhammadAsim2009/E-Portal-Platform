import pool from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runFix() {
  const fixPath = path.join(__dirname, '../database/fix_constraints.sql');
  if (!fs.existsSync(fixPath)) {
    console.error('Fix script not found at:', fixPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(fixPath, 'utf8');

  console.log('Applying unique constraints to students and faculty tables...');
  try {
    await pool.query(sql);
    console.log('Constraints added successfully.');
  } catch (err) {
    if (err.code === '23505') {
       console.error('Error: Duplicate user_id found. Please clean up duplicate profiles before applying this constraint.');
    } else if (err.code === '42710') {
       console.log('Constraints already exist.');
    } else {
       console.error('Failed to add constraints:', err.message);
    }
  } finally {
    await pool.end();
  }
}

runFix();
