import express from 'express';
import profileRoutes from './routes/profileRoutes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

const app = express();

app.use(express.json());

// Routes
app.get('/', (req, res) => {
  console.log('Access GET /');
  res.send('Thing is working');
});

app.use('/profiles', profileRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
