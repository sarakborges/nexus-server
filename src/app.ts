import express from 'express';

import { corsMiddleware } from '@/middlewares/cors.middleware.ts';
import { authMiddlewareExceptAuthRoutes } from '@/middlewares/auth.middleware.ts';
import { errorHandler } from '@/middlewares/errorHandler.middleware.ts';

import profileRoutes from '@/routes/profile.route.ts';
import authRoutes from '@/routes/auth.route.ts';
import usersRoutes from '@/routes/users.route.ts';
import feedRoutes from '@/routes/feed.route.ts';
import connectionsRoutes from '@/routes/connections.route.ts';

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(corsMiddleware);
app.use(authMiddlewareExceptAuthRoutes);

app.use('/profiles', profileRoutes);
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/feed', feedRoutes);
app.use('/connections', connectionsRoutes);

app.use(errorHandler);

export default app;
