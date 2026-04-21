import * as db from '../config/db.js';

async function updateSchema() {
  try {
    console.log('Starting schema update...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_devices (
        device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
        device_fingerprint TEXT NOT NULL, -- Hash of user-agent + other info
        user_agent TEXT,
        last_ip VARCHAR(45),
        last_login TIMESTAMP DEFAULT NOW(),
        is_trusted BOOLEAN DEFAULT true,
        UNIQUE(user_id, device_fingerprint)
      );
    `);
    
    console.log('Table login_devices created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Schema update failed:', err);
    process.exit(1);
  }
}

updateSchema();
