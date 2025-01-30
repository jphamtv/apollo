import express, { Request, Response, NextFunction, RequestHandler } from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
} from "../controllers/authController";
import { authenticateJWT } from "../middleware/authMiddleware";
import { User, AuthError, AuthRequest } from "../types/authTypes";

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: AuthError, user: User, info: { message: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .json({ message: info.message || "Invalid credentials" });
      }

      // Attach user to request if successful
      const authReq = req as AuthRequest;
      authReq.user = user;

      // Call the login handler to generate token
      return loginUser(authReq, res);
    },
  )(req, res, next);
});

// Protected routes
router.get("/verify", authenticateJWT, verifyUser as unknown as RequestHandler);
router.get("/logout", authenticateJWT, logoutUser);

export default router;
