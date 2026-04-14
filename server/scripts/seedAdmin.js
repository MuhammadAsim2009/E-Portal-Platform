import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const seedAdmin = async () => {
  const email = 'admin@gmail.com';
  const plainPassword = 'Admin123@';
  
  try {
    console.log('Connecting to database...');
    
    // Check if admin already exists
    const checkQuery = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (checkQuery.rows.length > 0) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    // Insert admin record
    const insertQuery = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, email, role;
    `;
    
    const res = await pool.query(insertQuery, ['System Administrator', email, hashedPassword, 'admin']);
    console.log('Success! Admin user created:', res.rows[0]);
    
  } catch (error) {
    console.error('Error seeding admin user:', error.message);
  } finally {
    // Close the DB pool so the script exits gracefully
    await pool.end();
  }
};

seedAdmin();
