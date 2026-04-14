import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';

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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'E-Portal API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
