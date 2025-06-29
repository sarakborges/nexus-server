import express from 'express';
import cors from 'cors';
import profileRoutes from './routes/profileRoutes.ts';
import authRoutes from './routes/authRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import feedRoutes from './routes/feedRoutes.ts';
import connectionsRoutes from './routes/connectionsRoutes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';
import { authenticateToken } from './middlewares/authMiddleware.ts';

const app = express();

const allowedOrigins = [
  'http://localhost',
  'https://nexus-theta-three.vercel.app',
];

// Configuração do CORS sem lançar erro
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Apenas nega, não lança erro para não quebrar o middleware
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
};

app.use(express.json({ limit: '5mb' }));

// Usa CORS com a configuração correta
app.use(cors(corsOptions));

// Middleware de autenticação
app.use(async (req, res, next) => {
  if (req.path.startsWith('/auth')) {
    return next();
  }
  authenticateToken(req, res, next);
});

// Rotas
app.use('/profiles', profileRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/feed', feedRoutes);
app.use('/connections', connectionsRoutes);

// Middleware global de erro (deve ficar após as rotas)
app.use(errorHandler);

export default app;
