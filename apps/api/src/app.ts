import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AppError } from './utils/AppError.js';

export const createApp = (): Express => {
  const app = express();

  // Security headers
  app.use(helmet());

  // Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
  }

  // Cookie parser
  app.use(cookieParser());

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // CORS Configuration
  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or same-origin server requests)
        if (!origin) return callback(null, true);

        if (
          allowedOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          env.NODE_ENV === 'development'
        ) {
          callback(null, true);
        } else {
          callback(new AppError(403, `Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Mount API routes
  app.use('/api', routes);

  // Handle 404
  app.all('*', (req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(404, `Cannot find ${req.method} ${req.originalUrl} on this server`));
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
