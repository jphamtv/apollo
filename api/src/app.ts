import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import passport from "passport";
import path from 'path';
import initializePassport from "./config/passportConfig";
import authRouter from "./routes/authRouter";
import userProfilesRouter from "./routes/userProfilesRouter";
import conversationsRouter from "./routes/conversationsRouter";
import messagesRouter from "./routes/messagesRouter";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Updated CORS setup to allow both client ports
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Initialize Passport
initializePassport();
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userProfilesRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/conversations/:conversationId/messages", messagesRouter);

// Error handing
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err); // Log error for debugging
  res.status(500).json({ error: "Something went wrong" }); // Send simple message to user to see
});

export default app;
