import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import suggestionsRoutes from './routes/suggestionsRoutes.ts';
import feedRoutes from './routes/feedRoutes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/profiles', profileRoutes);
app.use('/users', userRoutes);
app.use('/suggestions', suggestionsRoutes);
app.use('/feed', feedRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
