// Main application setup file that configures Express middleware, CORS, and routes
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import { logger } from './utils/logger';
import initializePassport from './config/passportConfig';
import authRouter from './routes/authRouter';
import userProfilesRouter from './routes/userProfilesRouter';
import conversationsRouter from './routes/conversationsRouter';
import messagesRouter from './routes/messagesRouter';
import { corsOptionsBase } from './config/corsConfig';

const app: Express = express();

// Trust proxy (nginx)
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup to allow both development ports (5173, 5174) and production client URL
const corsOptions = {
  ...corsOptionsBase,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Initialize Passport
initializePassport();
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userProfilesRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/conversations/:conversationId/messages', messagesRouter);

// Global error handler for unhandled exceptions
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error(`Unhandled error: ${err}`); // Log error for debugging
  res.status(500).json({ error: 'Something went wrong' }); // Send simple message to user to see
});

export default app;
