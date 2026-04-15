import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import adminRoutes from './routes/admin.routes.js';
import facultyRoutes from './routes/faculty.routes.js';
import pool from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true // Required for HttpOnly cookies
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/faculty', facultyRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'E-Portal API is running' });
});

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    // Ping DB to trigger connection log explicitly on boot
    await pool.query('SELECT NOW()');
  } catch (err) {
    console.error('Failed to establish database connection on startup:', err.message);
  }
});
