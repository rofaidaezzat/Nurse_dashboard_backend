import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';
import 'express-async-errors';

import staffRoutes from './routes/staff.routes';
import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';
import errorHandler from './middlewares/errorHandler.middleware';
import notFound from './middlewares/notFound.middleware';
import connectDB from './config/db';

const app = express();

// ─── Security Middlewares ────────────────────────────────────────────────────
app.use(helmet());

// Configure CORS to support multiple client URLs and credentialed requests
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes.',
});
app.use('/api', limiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HTTP Logging ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Database Connection Middleware ──────────────────────────────────────────
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth',   authRoutes);
app.use('/api/v1/staff',  staffRoutes);
app.use('/api/v1/upload', uploadRoutes);

// ─── Welcome / Root Route ────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the Nurse Dashboard API 🚀',
    healthCheck: '/api/health',
    version: '1.0.0'
  });
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'OK', message: 'Nurse Dashboard API is running 🚀' });
});

// ─── Error Handlers ──────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
