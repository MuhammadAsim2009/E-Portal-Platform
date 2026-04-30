import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

// Submit contact message
router.post('/contact', async (req, res) => {
  const { name, email, institution, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO contact_messages (name, email, institution, subject, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, institution, subject, message]
    );

    res.status(201).json({
      message: 'Message sent successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error submitting contact message:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
