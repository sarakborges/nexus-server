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

app.use(express.json({ limit: '5mb' }));
app.use(cors());

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
