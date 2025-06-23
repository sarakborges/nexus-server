import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import suggestionsRoutes from './routes/suggestionsRoutes.ts';
import feedRoutes from './routes/feedRoutes.ts';
import connectionsRoutes from './routes/connectionsRoutes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import { authenticateToken } from './middlewares/authMiddleware.ts';

const app = express();

const allowedOrigins = [
  'http://localhost',
  'https://nexus-theta-three.vercel.app',
];

app.use(express.json({ limit: '5mb' }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.options(
  '*',

  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(async (req, res, next) => {
  if (req.path.startsWith('/auth')) {
    return next();
  }

  authenticateToken(req, res, next);
});

// Routes
app.use('/profiles', profileRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/suggestions', suggestionsRoutes);
app.use('/feed', feedRoutes);
app.use('/connections', connectionsRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
