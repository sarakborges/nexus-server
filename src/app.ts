import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import suggestionsRoutes from './routes/suggestionsRoutes.ts';
import feedRoutes from './routes/feedRoutes.ts';
import connectionsRoutes from './routes/connectionsRoutes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(cors());

// Routes
app.use('/profiles', profileRoutes);
app.use('/users', userRoutes);
app.use('/suggestions', suggestionsRoutes);
app.use('/feed', feedRoutes);
app.use('/connections', connectionsRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
