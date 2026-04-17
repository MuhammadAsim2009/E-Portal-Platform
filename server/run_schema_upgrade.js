import pool from './config/db.js';

async function applyFixes() {
  try {
    console.log("Applying DB schema upgrades...");
    
    await pool.query("ALTER TABLE fees ADD COLUMN IF NOT EXISTS waiver_justification TEXT;");
    console.log("Added waiver_justification to fees table.");
    
    // Also, we can add it to payments if it's simpler? No, fee is where discounts/waivers are tracked natively.
    // Wait, the client updates payment status, not fee status. Let me add it to payments just in case.
    await pool.query("ALTER TABLE payments ADD COLUMN IF NOT EXISTS waiver_justification TEXT;");
    console.log("Added waiver_justification to payments table.");
    
    console.log("Upgrades successful.");
  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await pool.end();
  }
}

applyFixes();
