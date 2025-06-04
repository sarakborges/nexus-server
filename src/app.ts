import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

const app = express();

app.use(express.json());

// Routes
app.use('/profiles', profileRoutes);
app.use('/users', userRoutes);
app.use(cors());

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
