import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../server/.env' });

async function initDB() {
  const rootPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
    database: 'postgres'
  });

  try {
    const res = await rootPool.query("SELECT 1 FROM pg_database WHERE datname='e_portal_db'");
    if (res.rowCount === 0) {
      await rootPool.query("CREATE DATABASE e_portal_db");
      console.log('Database e_portal_db created.');
    } else {
      console.log('Database e_portal_db already exists.');
    }
  } catch (err) {
    console.error('Error checking/creating db:', err.message);
  } finally {
    await rootPool.end();
  }

  const appPool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    password: process.env.DB_PASSWORD || 'admin',
    port: process.env.DB_PORT || 5432,
    database: 'e_portal_db'
  });

  try {
    const schemaSql = fs.readFileSync('../database/schema.sql', 'utf8');
    await appPool.query(schemaSql);
    console.log('Schema applied successfully.');
  } catch (err) {
    console.error('Error applying schema:', err.message);
  } finally {
    await appPool.end();
  }
}

initDB();
